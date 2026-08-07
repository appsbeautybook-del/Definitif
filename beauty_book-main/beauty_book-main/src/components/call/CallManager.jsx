import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';
import { useAuth } from "@/lib/AuthContext";
import { useWebRTC } from "./useWebRTC";
import CallScreen from "./CallScreen";

const CallContext = createContext(null);
export function useCall() { return useContext(CallContext); }

export function CallManager({ children }) {
  const { user } = useAuth();
  const [callState, setCallState] = useState(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const callIdRef = useRef(null);
  const callStartedAtRef = useRef(null);
  const channelRef = useRef(null);
  const ringTimeoutRef = useRef(null);

  const onRemoteStream = useCallback((stream) => {
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream;
  }, []);

  const onEnd = useCallback(() => cleanup(), []);

  const { createOffer, createAnswer, setRemoteAnswer, addIceCandidate, close: closePC } = useWebRTC({
    callId: callIdRef.current, localStreamRef, onRemoteStream, onEnd,
  });

  const getMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    return stream;
  };

  const cleanup = useCallback(() => {
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    closePC();
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    clearTimeout(ringTimeoutRef.current);
    callIdRef.current = null;
    callStartedAtRef.current = null;
    setCallState(null);
  }, [closePC]);

  const saveCallLog = useCallback(async (callId, callerEmail, callerName, callerAvatar, calleeEmail, calleeName, calleeAvatar, status, startedAt, endedAt) => {
    const durationSec = (startedAt && endedAt) ? Math.round((new Date(endedAt) - new Date(startedAt)) / 1000) : 0;
    try {
      await entities.CallLog.create({
        call_id: callId, caller_email: callerEmail, caller_name: callerName || callerEmail, caller_avatar: callerAvatar || null,
        callee_email: calleeEmail, callee_name: calleeName || calleeEmail, callee_avatar: calleeAvatar || null,
        status, duration_sec: durationSec, started_at: startedAt || new Date().toISOString(), ended_at: endedAt || new Date().toISOString(),
      });
    } catch (e) { console.error("saveCallLog:", e); }
  }, []);

  const sendNotification = useCallback(async (toEmail, title, body) => {
    try {
      await entities.Notification.create({
        user_email: toEmail, type: "call", title, body, icon: "📞",
        link: `/messages?to=${user?.email || ""}`, read: false, data: {},
      });
    } catch (e) { console.error("notif:", e); }
  }, [user]);

  // ── Initier un appel ────────────────────────────────────────────────────────
  const startCall = useCallback(async ({ targetEmail, targetName, targetAvatar }) => {
    if (!user) return;
    const callId = `${user.email}_${targetEmail}_${Date.now()}`;
    callIdRef.current = callId;

    setCallState({ callId, mode: "calling", targetEmail, targetName, targetAvatar, isCaller: true });

    let stream;
    try { stream = await getMic(); } catch { alert("Microphone inaccessible."); cleanup(); return; }

    const offer = await createOffer(stream);

    // Canal dédié pour cet appel
    const channelName = `call_${callId}`;
    const channel = supabase.channel(channelName, { config: { broadcast: { self: false } } });

    // Écouter les réponses
    channel.on("broadcast", { event: "answer" }, async ({ payload }) => {
      if (payload.callId !== callId) return;
      await setRemoteAnswer(payload.sdp);
      callStartedAtRef.current = new Date().toISOString();
      setCallState(s => s ? { ...s, mode: "active" } : s);
    });

    channel.on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
      if (payload.callId !== callId) return;
      await addIceCandidate(payload.candidate);
    });

    channel.on("broadcast", { event: "reject" }, ({ payload }) => {
      if (payload.callId !== callId) return;
      saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "outgoing", null, new Date().toISOString());
      cleanup();
    });

    channel.on("broadcast", { event: "end" }, ({ payload }) => {
      if (payload.callId !== callId) return;
      saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "outgoing", callStartedAtRef.current, new Date().toISOString());
      cleanup();
    });

    await channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // Envoyer l'offre à l'appelé via un canal dédié au receiver
        const receiverChannel = supabase.channel(`call_incoming_${targetEmail}`);
        await receiverChannel.subscribe();
        receiverChannel.send({ type: "broadcast", event: "incoming_call", payload: {
          callId, callerEmail: user.email, callerName: user.full_name || user.email,
          callerAvatar: user.avatar_url || null, targetEmail, targetName, targetAvatar,
          offer: offer, channelName,
        }});
        // Cleanup le canal receiver après envoi
        setTimeout(() => supabase.removeChannel(receiverChannel), 2000);
      }
    });

    channelRef.current = channel;

    // Notification
    await sendNotification(targetEmail, `📞 Appel de ${user.full_name || user.email}`, "Appel en cours...");

    // Timeout 30s
    ringTimeoutRef.current = setTimeout(() => {
      setCallState(s => {
        if (s?.callId === callId && s?.mode === "calling") {
          saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "missed", null, new Date().toISOString());
          sendNotification(targetEmail, `📵 Appel manqué`, `Vous avez manqué un appel de ${user.full_name || user.email}`);
          cleanup();
        }
        return s;
      });
    }, 30000);
  }, [user, createOffer, setRemoteAnswer, addIceCandidate, cleanup, saveCallLog, sendNotification]);

  // ── Écouter les appels entrants ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`call_incoming_${user.email}`);
    channel.on("broadcast", { event: "incoming_call" }, async ({ payload }) => {
      if (payload.targetEmail !== user.email) return;
      if (callState) return; // déjà en appel

      callIdRef.current = payload.callId;
      setCallState({
        callId: payload.callId, mode: "ringing",
        targetEmail: payload.callerEmail, targetName: payload.callerName, targetAvatar: payload.callerAvatar,
        isCaller: false, offerSDP: payload.offer, channelName: payload.channelName,
      });
    });
    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.email, callState?.mode]);

  // ── Accepter ────────────────────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!callState || callState.mode !== "ringing") return;
    let stream;
    try { stream = await getMic(); } catch { alert("Microphone inaccessible."); rejectCall(); return; }

    const answer = await createAnswer(stream, callState.offerSDP);

    // Rejoindre le canal de l'appel
    const channel = supabase.channel(callState.channelName);
    await channel.subscribe();
    channel.send({ type: "broadcast", event: "answer", payload: { callId: callState.callId, sdp: answer } });

    callStartedAtRef.current = new Date().toISOString();

    // Écouter ICE + end
    channel.on("broadcast", { event: "ice-candidate" }, async ({ payload }) => {
      if (payload.callId !== callState.callId) return;
      await addIceCandidate(payload.candidate);
    });
    channel.on("broadcast", { event: "end" }, ({ payload }) => {
      if (payload.callId !== callState.callId) return;
      saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user.email, user.full_name, user.avatar_url, "received", callStartedAtRef.current, new Date().toISOString());
      cleanup();
    });

    channelRef.current = channel;
    setCallState(s => s ? { ...s, mode: "active" } : s);
  }, [callState, user, createAnswer, addIceCandidate, cleanup, saveCallLog]);

  // ── Refuser ─────────────────────────────────────────────────────────────────
  const rejectCall = useCallback(async () => {
    if (!callState) return;
    if (callState.channelName) {
      const ch = supabase.channel(callState.channelName);
      await ch.subscribe();
      ch.send({ type: "broadcast", event: "reject", payload: { callId: callState.callId } });
      setTimeout(() => supabase.removeChannel(ch), 500);
    }
    await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user?.email, user?.full_name, user?.avatar_url, "rejected", null, new Date().toISOString());
    cleanup();
  }, [callState, user, cleanup, saveCallLog]);

  // ── Raccrocher ──────────────────────────────────────────────────────────────
  const hangup = useCallback(async () => {
    if (!callState) return;
    const endedAt = new Date().toISOString();
    if (callState.channelName && channelRef.current) {
      channelRef.current.send({ type: "broadcast", event: "end", payload: { callId: callState.callId } });
    }
    if (callState.isCaller) {
      await saveCallLog(callState.callId, user?.email, user?.full_name, user?.avatar_url, callState.targetEmail, callState.targetName, callState.targetAvatar, "outgoing", callStartedAtRef.current, endedAt);
    } else {
      await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user?.email, user?.full_name, user?.avatar_url, "received", callStartedAtRef.current, endedAt);
    }
    cleanup();
  }, [callState, user, cleanup, saveCallLog]);

  return (
    <CallContext.Provider value={{ startCall, hangup, inCall: !!callState }}>
      {children}
      {callState && (
        <CallScreen mode={callState.mode} targetName={callState.targetName} targetAvatar={callState.targetAvatar}
          onHangup={hangup} onAccept={acceptCall} onReject={rejectCall} remoteAudioRef={remoteAudioRef}
          targetEmail={callState.targetEmail} currentUserEmail={user?.email} />
      )}
    </CallContext.Provider>
  );
}
