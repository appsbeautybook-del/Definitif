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
  const pollRef = useRef(null);
  const ringTimeoutRef = useRef(null);
  const incomingCallRef = useRef(null);

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
    clearInterval(pollRef.current);
    clearTimeout(ringTimeoutRef.current);
    callIdRef.current = null;
    callStartedAtRef.current = null;
    setCallState(null);
  }, [closePC]);

  const saveCallLog = useCallback(async (callId, callerEmail, callerName, callerAvatar, calleeEmail, calleeName, calleeAvatar, status, startedAt, endedAt) => {
    const durationSec = (startedAt && endedAt) ? Math.round((new Date(endedAt) - new Date(startedAt)) / 1000) : 0;
    try {
      await supabase.from("CallLog").insert({
        caller_email: callerEmail,
        callee_email: calleeEmail,
        status, duration_sec: durationSec,
        started_at: startedAt || new Date().toISOString(),
        ended_at: endedAt || new Date().toISOString(),
      });
    } catch (e) { console.error("saveCallLog:", e); }
  }, []);

  // Polling pour les signaux d'appel
  const startPolling = useCallback((callId, targetEmail, onSignal) => {
    clearInterval(pollRef.current);
    const seen = new Set();
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await supabase.from("call_signals")
          .select("*").eq("call_id", callId)
          .order("created_at", { ascending: true });
        for (const sig of (data || [])) {
          if (seen.has(sig.id)) continue;
          seen.add(sig.id);
          onSignal(sig);
        }
      } catch (e) { console.error("poll error:", e); }
    }, 2000);
  }, []);

  // ── Initier un appel ────────────────────────────────────────────────────────
  const startCall = useCallback(async ({ targetEmail, targetName, targetAvatar }) => {
    if (!user) return;
    const callId = `${user.email}_${targetEmail}_${Date.now()}`;
    callIdRef.current = callId;
    setCallState({ callId, mode: "calling", targetEmail, targetName, targetAvatar, isCaller: true });

    let stream;
    try { stream = await getMic(); } catch { alert("Microphone inaccessible."); cleanup(); return; }

    const offer = await createOffer(stream);

    // Envoyer l'offre via call_signals
    const { error: insertError } = await supabase.from("call_signals").insert({
      call_id: callId, caller_email: user.email,
      callee_email: targetEmail, signal_type: "offer", payload: JSON.stringify(offer), status: "ringing",
    });
    if (insertError) console.error("Insert offer error:", insertError);

    // Envoyer une notification push
    try {
      await entities.Notification.create({
        user_email: targetEmail, type: "call", title: `📞 Appel de ${user.full_name || user.email}`,
        body: "Appel entrant - touchez pour répondre", icon: "📞",
        link: `/messages?to=${user.email}&name=${encodeURIComponent(user.full_name || user.email)}&call_id=${callId}`,
        read: false, data: { call_id: callId, caller_email: user.email, caller_name: user.full_name },
      });
    } catch (e) { console.error("notif error:", e); }

    // Polling pour les réponses
    startPolling(callId, targetEmail, async (sig) => {
      if (sig.call_id !== callId) return;
      if (sig.signal_type === "answer") {
        await setRemoteAnswer(JSON.parse(sig.payload));
        callStartedAtRef.current = new Date().toISOString();
        setCallState(s => s ? { ...s, mode: "active" } : s);
      } else if (sig.signal_type === "ice-candidate") {
        await addIceCandidate(JSON.parse(sig.payload).candidate);
      } else if (sig.signal_type === "reject" || sig.signal_type === "end") {
        saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, sig.signal_type === "reject" ? "missed" : "outgoing", null, new Date().toISOString());
        cleanup();
      }
    });

    // Timeout 30s
    ringTimeoutRef.current = setTimeout(() => {
      setCallState(s => {
        if (s?.callId === callId && s?.mode === "calling") {
          saveCallLog(callId, user.email, user.full_name, user.avatar_url, targetEmail, targetName, targetAvatar, "missed", null, new Date().toISOString());
          cleanup();
        }
        return s;
      });
    }, 30000);
  }, [user, createOffer, setRemoteAnswer, addIceCandidate, cleanup, saveCallLog, startPolling]);

  // ── Écouter les appels entrants (polling) ───────────────────────────────────
  useEffect(() => {
    if (!user || callState) return;
    const seen = new Set();
    const check = setInterval(async () => {
      try {
        const { data, error } = await supabase.from("call_signals")
          .select("*").eq("callee_email", user.email).eq("signal_type", "offer").eq("status", "ringing")
          .order("created_at", { ascending: false }).limit(5);
        if (error) { console.error("Poll incoming error:", error); return; }
        for (const sig of (data || [])) {
          if (seen.has(sig.id)) continue;
          // Vérifier que l'appel n'est pas trop vieux (> 30s)
          const age = Date.now() - new Date(sig.created_at).getTime();
          if (age > 35000) { seen.add(sig.id); continue; }
          seen.add(sig.id);
          callIdRef.current = sig.call_id;
          setCallState({
            callId: sig.call_id, mode: "ringing",
            targetEmail: sig.caller_email, targetName: sig.caller_name || sig.caller_email, targetAvatar: null,
            isCaller: false, offerSDP: JSON.parse(sig.payload),
          });
          break;
        }
      } catch (e) { console.error("Poll error:", e); }
    }, 2000);
    return () => clearInterval(check);
  }, [user?.email, callState?.mode]);

  // ── Accepter ────────────────────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!callState || callState.mode !== "ringing") return;
    let stream;
    try { stream = await getMic(); } catch { alert("Microphone inaccessible."); rejectCall(); return; }

    const answer = await createAnswer(stream, callState.offerSDP);

    await supabase.from("call_signals").insert({
      call_id: callState.callId, caller_email: user.email, callee_email: callState.targetEmail,
      signal_type: "answer", payload: JSON.stringify(answer), status: "accepted",
    });

    callStartedAtRef.current = new Date().toISOString();

    startPolling(callState.callId, callState.targetEmail, async (sig) => {
      if (sig.signal_type === "ice-candidate") {
        await addIceCandidate(JSON.parse(sig.payload).candidate);
      } else if (sig.signal_type === "end") {
        saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user.email, user.full_name, user.avatar_url, "received", callStartedAtRef.current, new Date().toISOString());
        cleanup();
      }
    });

    setCallState(s => s ? { ...s, mode: "active" } : s);
  }, [callState, user, createAnswer, addIceCandidate, cleanup, saveCallLog, startPolling]);

  // ── Refuser ─────────────────────────────────────────────────────────────────
  const rejectCall = useCallback(async () => {
    if (!callState) return;
    try {
      await supabase.from("call_signals").insert({
        call_id: callState.callId, caller_email: user?.email || "", callee_email: callState.targetEmail,
        signal_type: "reject", payload: "", status: "rejected",
      });
    } catch (_) {}
    await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user?.email, user?.full_name, user?.avatar_url, "rejected", null, new Date().toISOString());
    cleanup();
  }, [callState, user, cleanup, saveCallLog]);

  // ── Raccrocher ──────────────────────────────────────────────────────────────
  const hangup = useCallback(async () => {
    if (!callState) return;
    const endedAt = new Date().toISOString();
    try {
      await supabase.from("call_signals").insert({
        call_id: callState.callId, caller_email: user?.email || "", callee_email: callState.targetEmail,
        signal_type: "end", payload: "", status: "ended",
      });
    } catch (_) {}
    if (callState.isCaller) {
      await saveCallLog(callState.callId, user?.email, user?.full_name, user?.avatar_url, callState.targetEmail, callState.targetName, callState.targetAvatar, "outgoing", callStartedAtRef.current, endedAt);
    } else {
      await saveCallLog(callState.callId, callState.targetEmail, callState.targetName, callState.targetAvatar, user?.email, user?.full_name, user?.avatar_url, "received", callStartedAtRef.current, endedAt);
    }
    cleanup();
  }, [callState, user, cleanup, saveCallLog]);

  // ── Messages rapides (pour celui qui REÇOIT l'appel) ────────────────────────
  const sendQuickMessage = useCallback(async (msg) => {
    if (!callState || callState.isCaller || !user) return;
    const convId = [user?.email, callState.targetEmail].sort().join("_");
    try {
      await supabase.from("MessageChat").insert({
        conversation_id: convId, sender_email: user?.email,
        receiver_email: callState.targetEmail,
        content: msg, read: false,
      });
    } catch (_) {}
    await rejectCall();
  }, [callState, user, rejectCall]);

  return (
        <CallContext.Provider value={{ startCall, hangup, acceptCall, rejectCall, inCall: !!callState, sendQuickMessage }}>
      {children}
      {callState && (
        <CallScreen mode={callState.mode} targetName={callState.targetName} targetAvatar={callState.targetAvatar}
          onHangup={hangup} onAccept={acceptCall} onReject={rejectCall} remoteAudioRef={remoteAudioRef}
          targetEmail={callState.targetEmail} currentUserEmail={user?.email}
          isCallee={!callState.isCaller} sendQuickMessage={sendQuickMessage} />
      )}
    </CallContext.Provider>
  );
}
