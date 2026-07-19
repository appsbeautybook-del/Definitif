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
  // null | { callId, mode, targetName, targetAvatar, targetEmail, isCaller }

  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const signalUnsubRef = useRef(null);
  const callIdRef = useRef(null);
  const callStartedAtRef = useRef(null); // timestamp de début appel actif

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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const sendNotification = useCallback(async (toEmail, title, body, link = "/messages") => {
    try {
      await entities.Notification.create({
        user_email: toEmail,
        type: "message",
        title,
        body,
        icon: "📞",
        link,
        read: false,
        data: {},
      });
    } catch (e) {
      console.error("notif error:", e);
    }
  }, []);

  const saveCallLog = useCallback(async (callId, callerEmail, callerName, callerAvatar, calleeEmail, calleeName, calleeAvatar, status, startedAt, endedAt) => {
    const durationSec = (startedAt && endedAt)
      ? Math.round((new Date(endedAt) - new Date(startedAt)) / 1000)
      : 0;
    try {
      await entities.CallLog.create({
        call_id: callId,
        caller_email: callerEmail,
        caller_name: callerName || callerEmail,
        caller_avatar: callerAvatar || null,
        callee_email: calleeEmail,
        callee_name: calleeName || calleeEmail,
        callee_avatar: calleeAvatar || null,
        status,
        duration_sec: durationSec,
        started_at: startedAt || new Date().toISOString(),
        ended_at: endedAt || new Date().toISOString(),
      });
    } catch (e) {
      console.error("saveCallLog error:", e);
    }
  }, []);

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
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
    try { stream = await getMic(); }
    catch {
      alert("Impossible d'accéder au microphone.");
      cleanup();
      return;
    }

    const offer = await createOffer(stream);

    await entities.CallSignal.create({
      call_id: callId,
      caller_email: user.email,
      caller_name: user.full_name || user.email,
      caller_avatar: user.avatar_url || null,
      callee_email: targetEmail,
      type: "offer",
      payload: JSON.stringify(offer),
      status: "ringing",
    });

    // Notifier l'appelé
    await sendNotification(
      targetEmail,
      `📞 Appel entrant de ${user.full_name || user.email}`,
      "Touchez pour répondre",
      `/messages?to=${user.email}&name=${encodeURIComponent(user.full_name || user.email)}`
    );

    // Écouter la réponse
    signalUnsubRef.current = entities.CallSignal.subscribe(async (event) => {
      if (event.type !== "create" && event.type !== "update") return;
      const sig = event.data;
      if (sig?.call_id !== callId) return;

      if (sig.type === "answer") {
        await setRemoteAnswer(JSON.parse(sig.payload));
        callStartedAtRef.current = new Date().toISOString();
        setCallState(s => s ? { ...s, mode: "active" } : s);
      } else if (sig.type === "ice-candidate") {
        const { candidate } = JSON.parse(sig.payload);
        await addIceCandidate(candidate);
      } else if (sig.type === "reject") {
        // Appelé a refusé → log "rejected" pour l'appelant
        await saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "outgoing", null, new Date().toISOString());
        cleanup();
      } else if (sig.type === "end") {
        const endedAt = new Date().toISOString();
        await saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "outgoing", callStartedAtRef.current, endedAt);
        cleanup();
      }
    });

    // Timeout 30s → appel manqué
    setTimeout(async () => {
      setCallState(s => {
        if (s?.callId === callId && s?.mode === "calling") {
          // Log appel manqué pour l'appelé
          saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "missed", null, new Date().toISOString());
          // Notif appel manqué pour l'appelé
          sendNotification(
            targetEmail,
            `📵 Appel manqué de ${user.full_name || user.email}`,
            "Vous avez manqué un appel",
            `/messages?to=${user.email}&name=${encodeURIComponent(user.full_name || user.email)}`
          );
          cleanup();
        }
        return s;
      });
    }, 30000);
  }, [user, createOffer, setRemoteAnswer, addIceCandidate, cleanup, sendNotification, saveCallLog]);

  // ── Écouter les appels entrants ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = entities.CallSignal.subscribe(async (event) => {
      if (event.type !== "create") return;
      const sig = event.data;
      if (sig?.callee_email !== user.email || sig?.type !== "offer") return;
      if (callState) return;

      callIdRef.current = sig.call_id;
      setCallState({
        callId: sig.call_id,
        mode: "ringing",
        targetEmail: sig.caller_email,
        targetName: sig.caller_name || sig.caller_email,
        targetAvatar: sig.caller_avatar || null,
        isCaller: false,
        offerSDP: JSON.parse(sig.payload),
      });
    });
    return () => unsub();
  }, [user, callState]);

  // ── Accepter l'appel ────────────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!callState || callState.mode !== "ringing") return;
    let stream;
    try { stream = await getMic(); }
    catch { alert("Impossible d'accéder au microphone."); rejectCall(); return; }

    const answer = await createAnswer(stream, callState.offerSDP);
    await entities.CallSignal.create({
      call_id: callState.callId,
      caller_email: user.email,
      callee_email: callState.targetEmail,
      type: "answer",
      payload: JSON.stringify(answer),
      status: "accepted",
    });

    callStartedAtRef.current = new Date().toISOString();

    signalUnsubRef.current = entities.CallSignal.subscribe(async (event) => {
      if (event.type !== "create") return;
      const sig = event.data;
      if (sig?.call_id !== callState.callId) return;
      if (sig.type === "ice-candidate") {
        const { candidate } = JSON.parse(sig.payload);
        await addIceCandidate(candidate);
      } else if (sig.type === "end") {
        const endedAt = new Date().toISOString();
        // Log "received" pour l'appelé
        await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user.email, user.full_name, user.avatar_url, "received", callStartedAtRef.current, endedAt);
        cleanup();
      }
    });

    setCallState(s => s ? { ...s, mode: "active" } : s);
  }, [callState, user, createAnswer, addIceCandidate, cleanup, saveCallLog]);

  // ── Refuser l'appel ─────────────────────────────────────────────────────────
  const rejectCall = useCallback(async () => {
    if (!callState) return;
    await entities.CallSignal.create({
      call_id: callState.callId,
      caller_email: user?.email || "",
      callee_email: callState.targetEmail,
      type: "reject",
      payload: "",
      status: "rejected",
    }).catch(() => {});

    // Log "missed" pour l'appelant (vu du point de vue de l'appelé → il a rejeté)
    await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user.email, user.full_name, user.avatar_url, "rejected", null, new Date().toISOString());
    cleanup();
  }, [callState, user, cleanup, saveCallLog]);

  // ── Raccrocher ──────────────────────────────────────────────────────────────
  const hangup = useCallback(async () => {
    if (!callState) return;
    const endedAt = new Date().toISOString();

    await entities.CallSignal.create({
      call_id: callState.callId,
      caller_email: user?.email || "",
      callee_email: callState.targetEmail,
      type: "end",
      payload: "",
      status: "ended",
    }).catch(() => {});

    // Log selon le rôle
    if (callState.isCaller) {
      await saveCallLog(callState.callId, user.email, user.full_name, user.avatar_url, callState.targetEmail, callState.targetName, callState.targetAvatar, "outgoing", callStartedAtRef.current, endedAt);
    } else {
      await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user.email, user.full_name, user.avatar_url, "received", callStartedAtRef.current, endedAt);
    }
    cleanup();
  }, [callState, user, cleanup, saveCallLog]);

  return (
    <CallContext.Provider value={{ startCall, hangup, inCall: !!callState }}>
      {children}
      {callState && (
        <CallScreen
          mode={callState.mode}
          targetName={callState.targetName}
          targetAvatar={callState.targetAvatar}
          onHangup={hangup}
          onAccept={acceptCall}
          onReject={rejectCall}
          remoteAudioRef={remoteAudioRef}
        />
      )}
    </CallContext.Provider>
  );
}