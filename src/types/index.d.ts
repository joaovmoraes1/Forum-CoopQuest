declare module '@/services/stats' {
    export function getDailyChallenge(): Promise<any>;
    export function participateInChallenge(challengeId: number, userId: number): Promise<any>;
    export function checkChallengeParticipation(challengeId: number, userId: number): Promise<any>;
  }