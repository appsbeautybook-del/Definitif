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
  const callStartedAtRef = useRef(null);
  const callerEmailRef = useRef(null);
  const calleeEmailRef = useRef(null);
  const processingIncoming = useRef(false);

  const onRemoteStream = useCallback((stream) => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = stream;
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
    callerEmailRef.current = null;
    calleeEmailRef.current = null;
    callStartedAtRef.current = null;
    setCallState(null);
  }, []);

  const { createOffer, createAnswer, setRemoteAnswer, addIceCandidate, close: closePC } = useWebRTC({
    callIdRef,
    localStreamRef,
    onRemoteStream,
    onEnd: () => cleanup(),
    callerEmailRef,
    calleeEmailRef,
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const sendNotification = useCallback(async (toEmail, title, body, link = "/messages") => {
    try {
      await entities.Notification.create({
        user_email: toEmail,
        type: "call",
        title,
        body,
        icon: "📞",
        link,
        is_read: false,
        read: false,
        data: {},
      });
    } catch (e) {
      console.error("notif error:", e);
    }
  }, []);

  const saveCallLog = useCallback(async (cId, callerEmail, callerName, callerAvatar, calleeEmail, calleeName, calleeAvatar, status, startedAt, endedAt) => {
    const durationSec = (startedAt && endedAt)
      ? Math.round((new Date(endedAt) - new Date(startedAt)) / 1000)
      : 0;
    try {
      await entities.CallLog.create({
        call_id: cId,
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
    callerEmailRef.current = user.email;
    calleeEmailRef.current = targetEmail;

    setCallState({ callId, mode: "calling", targetEmail, targetName, targetAvatar, isCaller: true });

    let stream;
    try { stream = await getMic(); }
    catch {
      alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès au micro.");
      cleanup();
      return;
    }

    let offer;
    try {
      offer = await createOffer(stream);
    } catch (e) {
      console.error('[Call] createOffer error:', e);
      cleanup();
      return;
    }

    try {
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
    } catch (e) {
      console.error('[Call] signal create error:', e);
      cleanup();
      return;
    }

    // Notifier l'appelé
    await sendNotification(
      targetEmail,
      `📞 Appel entrant de ${user.full_name || user.email}`,
      "Touchez pour répondre",
      `/messages?to=${user.email}&name=${encodeURIComponent(user.full_name || user.email)}`
    );

    // Écouter la réponse (nettoyer l'ancien subscribe d'abord)
    if (signalUnsubRef.current) { signalUnsubRef.current(); signalUnsubRef.current = null; }
    signalUnsubRef.current = entities.CallSignal.subscribe(async (event) => {
      if (event.type !== "create" && event.type !== "update") return;
      const sig = event.data;
      if (!sig || sig.call_id !== callId) return;

      if (sig.type === "answer") {
        try {
          await setRemoteAnswer(JSON.parse(sig.payload));
        } catch (e) {
          console.error('[Call] setRemoteAnswer error:', e);
        }
        callStartedAtRef.current = new Date().toISOString();
        setCallState(s => s ? { ...s, mode: "active" } : s);
      } else if (sig.type === "ice-candidate") {
        try {
          const { candidate } = JSON.parse(sig.payload);
          await addIceCandidate(candidate);
        } catch (e) {
          console.warn('[Call] ICE candidate error:', e);
        }
      } else if (sig.type === "reject") {
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
          saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "missed", null, new Date().toISOString());
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
      if (!sig) return;
      if (sig.callee_email !== user.email || sig.type !== "offer") return;
      if (processingIncoming.current) return;
      if (callIdRef.current === sig.call_id) return;

      processingIncoming.current = true;
      callIdRef.current = sig.call_id;
      callerEmailRef.current = sig.caller_email;
      calleeEmailRef.current = sig.callee_email;

      setCallState({
        callId: sig.call_id,
        mode: "ringing",
        targetEmail: sig.caller_email,
        targetName: sig.caller_name || sig.caller_email,
        targetAvatar: sig.caller_avatar || null,
        isCaller: false,
        offerSDP: JSON.parse(sig.payload),
      });

      setTimeout(() => { processingIncoming.current = false; }, 2000);
    });
    return () => unsub();
  }, [user]);

  // ── Accepter l'appel ────────────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!callState || callState.mode !== "ringing") return;
    let stream;
    try { stream = await getMic(); }
    catch {
      alert("Impossible d'accéder au microphone. Veuillez autoriser l'accès au micro.");
      rejectCall();
      return;
    }

    const answer = await createAnswer(stream, callState.offerSDP);

    try {
      await entities.CallSignal.create({
        call_id: callState.callId,
        caller_email: callState.targetEmail,
        callee_email: user.email,
        type: "answer",
        payload: JSON.stringify(answer),
        status: "accepted",
      });
    } catch (e) {
      console.error('[Call] answer signal error:', e);
    }

    callStartedAtRef.current = new Date().toISOString();

    // Nettoyer l'ancien subscribe avant d'en créer un nouveau
    if (signalUnsubRef.current) { signalUnsubRef.current(); signalUnsubRef.current = null; }

    signalUnsubRef.current = entities.CallSignal.subscribe(async (event) => {
      if (event.type !== "create") return;
      const sig = event.data;
      if (!sig || sig.call_id !== callState.callId) return;
      if (sig.type === "ice-candidate") {
        try {
          const { candidate } = JSON.parse(sig.payload);
          await addIceCandidate(candidate);
        } catch (e) {
          console.warn('[Call] ICE candidate error (accept):', e);
        }
      } else if (sig.type === "end") {
        const endedAt = new Date().toISOString();
        await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user.email, user.full_name, user.avatar_url, "received", callStartedAtRef.current, endedAt);
        cleanup();
      }
    });

    setCallState(s => s ? { ...s, mode: "active" } : s);
  }, [callState, user, createAnswer, addIceCandidate, cleanup, saveCallLog]);

  // ── Refuser l'appel ─────────────────────────────────────────────────────────
  const rejectCall = useCallback(async () => {
    if (!callState) return;
    const callId = callState.callId;
    const targetEmail = callState.targetEmail;
    const targetName = callState.targetName;
    const targetAvatar = callState.targetAvatar;

    // Fermer l'écran immédiatement
    cleanup();

    // Tâches de nettoyage en arrière-plan
    Promise.all([
      entities.CallSignal.create({
        call_id: callId,
        caller_email: targetEmail || "",
        callee_email: user?.email || "",
        type: "reject",
        payload: "",
        status: "rejected",
      }).catch(() => {}),
      saveCallLog(callId, targetEmail, targetName, targetAvatar, user.email, user.full_name, user.avatar_url, "rejected", null, new Date().toISOString()).catch(() => {}),
    ]).catch(() => {});
  }, [callState, user, cleanup, saveCallLog]);

  // ── Raccrocher ──────────────────────────────────────────────────────────────
  const hangup = useCallback(async () => {
    if (!callState) return;
    const callId = callState.callId;
    const isCaller = callState.isCaller;
    const targetEmail = callState.targetEmail;
    const targetName = callState.targetName;
    const targetAvatar = callState.targetAvatar;

    // Fermer l'écran immédiatement
    cleanup();

    // Tâches de nettoyage en arrière-plan (sans bloquer l'UI)
    const endedAt = new Date().toISOString();
    Promise.all([
      entities.CallSignal.create({
        call_id: callId,
        caller_email: isCaller ? (user?.email || "") : (targetEmail || ""),
        callee_email: isCaller ? (targetEmail || "") : (user?.email || ""),
        type: "end",
        payload: "",
        status: "ended",
      }).catch(() => {}),
      saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, isCaller ? "outgoing" : "received", callStartedAtRef.current, endedAt).catch(() => {}),
    ]).catch(() => {});
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
