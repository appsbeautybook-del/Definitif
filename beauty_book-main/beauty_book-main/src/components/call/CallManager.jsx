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
  const signalUnsubRef = useRef(null);
  const callIdRef = useRef(null);
  const callStartedAtRef = useRef(null);

  const onRemoteStream = useCallback((stream) => {
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream;
  }, []);

  const onEnd = useCallback(() => cleanup(), []);

  const { createOffer, createAnswer, setRemoteAnswer, addIceCandidate, close: closePC } = useWebRTC({
    callId: callIdRef.current,
    localStreamRef,
    onRemoteStream,
    onEnd,
  });

  const getConvId = useCallback((a, b) => [a, b].sort().join("_"), []);

  const sendSignal = useCallback(async (callId, senderEmail, receiverEmail, signalType, payload) => {
    const convId = getConvId(senderEmail, receiverEmail);
    await supabase.from("MessageChat").insert({
      conversation_id: convId,
      sender_email: senderEmail,
      sender_name: "📞 Appel",
      receiver_email: receiverEmail,
      content: JSON.stringify({ type: `call_${signalType}`, callId, payload }),
      type: "text",
      read: false,
    });
  }, [getConvId]);

  const sendNotification = useCallback(async (toEmail, title, body, link) => {
    try {
      await entities.Notification.create({ user_email: toEmail, type: "message", title, body, icon: "📞", link: link || "/messages", read: false, data: {} });
    } catch {}
  }, []);

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

  const cleanup = useCallback(() => {
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    closePC();
    if (signalUnsubRef.current) { signalUnsubRef.current(); signalUnsubRef.current = null; }
    callIdRef.current = null;
    callStartedAtRef.current = null;
    setCallState(null);
  }, [closePC]);

  const getMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    return stream;
  };

  // ── Initier un appel ────────────────────────────────────────────────────────
  const startCall = useCallback(async ({ targetEmail, targetName, targetAvatar }) => {
    if (!user) return;
    const callId = `${user.email}_${targetEmail}_${Date.now()}`;
    callIdRef.current = callId;
    setCallState({ callId, mode: "calling", targetEmail, targetName, targetAvatar, isCaller: true });

    let stream;
    try { stream = await getMic(); } catch { alert("Impossible d'accéder au microphone."); cleanup(); return; }

    const offer = await createOffer(stream);
    await sendSignal(callId, user.email, targetEmail, "offer", offer);

    await sendNotification(targetEmail, `📞 Appel entrant de ${user.full_name || user.email}`, "Touchez pour répondre", `/messages?to=${user.email}&name=${encodeURIComponent(user.full_name || user.email)}`);

    // Écouter via Supabase Realtime sur MessageChat
    const convId = getConvId(user.email, targetEmail);
    const channel = supabase.channel(`call_${callId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "MessageChat", filter: `conversation_id=eq.${convId}` }, async (payload) => {
        const m = payload.new;
        if (!m || m.sender_email === user.email) return;
        try {
          const data = JSON.parse(m.content);
          if (data.callId !== callId) return;
          if (data.type === "call_answer") {
            await setRemoteAnswer(data.payload);
            callStartedAtRef.current = new Date().toISOString();
            setCallState(s => s ? { ...s, mode: "active" } : s);
          } else if (data.type === "call_ice") {
            await addIceCandidate(data.payload);
          } else if (data.type === "call_reject" || data.type === "call_end") {
            saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, data.type === "call_reject" ? "outgoing" : "outgoing", null, new Date().toISOString());
            cleanup();
          }
        } catch {}
      })
      .subscribe();
    signalUnsubRef.current = () => supabase.removeChannel(channel);

    // Timeout 30s
    setTimeout(() => {
      setCallState(s => {
        if (s?.callId === callId && s?.mode === "calling") {
          saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "missed", null, new Date().toISOString());
          sendNotification(targetEmail, `📵 Appel manqué de ${user.full_name || user.email}`, "Vous avez manqué un appel", `/messages?to=${user.email}`);
          cleanup();
        }
        return s;
      });
    }, 30000);
  }, [user, createOffer, setRemoteAnswer, addIceCandidate, cleanup, sendNotification, saveCallLog, sendSignal, getConvId]);

  // ── Écouter les appels entrants ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`incoming_calls_${user.email}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "MessageChat" }, (payload) => {
        const m = payload.new;
        if (!m || m.receiver_email !== user.email || m.sender_email === user.email) return;
        try {
          const data = JSON.parse(m.content);
          if (data.type !== "call_offer" || callState) return;
          callIdRef.current = data.callId;
          setCallState({
            callId: data.callId, mode: "ringing",
            targetEmail: m.sender_email, targetName: m.sender_name || m.sender_email, targetAvatar: null,
            isCaller: false, offerSDP: data.payload,
          });
        } catch {}
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.email, callState?.mode]);

  // ── Accepter l'appel ────────────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!callState || callState.mode !== "ringing") return;
    let stream;
    try { stream = await getMic(); } catch { alert("Microphone inaccessible."); rejectCall(); return; }

    const answer = await createAnswer(stream, callState.offerSDP);
    await sendSignal(callState.callId, user.email, callState.targetEmail, "answer", answer);

    callStartedAtRef.current = new Date().toISOString();

    const convId = getConvId(user.email, callState.targetEmail);
    const channel = supabase.channel(`call_answer_${callState.callId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "MessageChat", filter: `conversation_id=eq.${convId}` }, async (payload) => {
        const m = payload.new;
        if (!m || m.sender_email === user.email) return;
        try {
          const data = JSON.parse(m.content);
          if (data.callId !== callState.callId) return;
          if (data.type === "call_ice") { await addIceCandidate(data.payload); }
          else if (data.type === "call_end") {
            saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user.email, user.full_name, user.avatar_url, "received", callStartedAtRef.current, new Date().toISOString());
            cleanup();
          }
        } catch {}
      })
      .subscribe();
    signalUnsubRef.current = () => supabase.removeChannel(channel);
    setCallState(s => s ? { ...s, mode: "active" } : s);
  }, [callState, user, createAnswer, addIceCandidate, cleanup, saveCallLog, sendSignal, getConvId]);

  // ── Refuser l'appel ─────────────────────────────────────────────────────────
  const rejectCall = useCallback(async () => {
    if (!callState) return;
    await sendSignal(callState.callId, user?.email || "", callState.targetEmail, "reject", null).catch(() => {});
    await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user?.email || "", user?.full_name, user?.avatar_url, "rejected", null, new Date().toISOString());
    cleanup();
  }, [callState, user, cleanup, saveCallLog, sendSignal]);

  // ── Raccrocher ──────────────────────────────────────────────────────────────
  const hangup = useCallback(async () => {
    if (!callState) return;
    const endedAt = new Date().toISOString();
    await sendSignal(callState.callId, user?.email || "", callState.targetEmail, "end", null).catch(() => {});
    if (callState.isCaller) {
      await saveCallLog(callState.callId, user?.email, user?.full_name, user?.avatar_url, callState.targetEmail, callState.targetName, callState.targetAvatar, "outgoing", callStartedAtRef.current, endedAt);
    } else {
      await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user?.email, user?.full_name, user?.avatar_url, "received", callStartedAtRef.current, endedAt);
    }
    cleanup();
  }, [callState, user, cleanup, saveCallLog, sendSignal]);

  return (
    <CallContext.Provider value={{ startCall, hangup, inCall: !!callState }}>
      {children}
      {callState && (
        <CallScreen mode={callState.mode} targetName={callState.targetName} targetAvatar={callState.targetAvatar}
          onHangup={hangup} onAccept={acceptCall} onReject={rejectCall} remoteAudioRef={remoteAudioRef} />
      )}
    </CallContext.Provider>
  );
}
