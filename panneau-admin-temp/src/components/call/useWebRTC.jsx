import { useRef, useCallback } from "react";
import { entities } from '@/api/entities';
import { supabase } from '@/api/supabaseClient';

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function useWebRTC({ callId, localStreamRef, onRemoteStream, onEnd }) {
  const pcRef = useRef(null);

  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.ontrack = (event) => {
      if (onRemoteStream) onRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await entities.CallSignal.create({
          call_id: callId,
          caller_email: "_ice_",
          callee_email: "_ice_",
          type: "ice-candidate",
          payload: JSON.stringify({ candidate: event.candidate, callId }),
        }).catch(() => {});
      }
    };

    pc.onconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        onEnd && onEnd();
      }
    };

    pcRef.current = pc;
    return pc;
  }, [callId, onRemoteStream, onEnd]);

  const addLocalTracks = useCallback((pc, stream) => {
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
  }, []);

  const createOffer = useCallback(async (stream) => {
    const pc = createPC();
    addLocalTracks(pc, stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return offer;
  }, [createPC, addLocalTracks]);

  const createAnswer = useCallback(async (stream, offerSDP) => {
    const pc = createPC();
    addLocalTracks(pc, stream);
    await pc.setRemoteDescription(new RTCSessionDescription(offerSDP));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return answer;
  }, [createPC, addLocalTracks]);

  const setRemoteAnswer = useCallback(async (answerSDP) => {
    if (pcRef.current) {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answerSDP));
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate) => {
    if (pcRef.current && pcRef.current.remoteDescription) {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    }
  }, []);

  const close = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }, []);

  return { createOffer, createAnswer, setRemoteAnswer, addIceCandidate, close, pcRef };
}