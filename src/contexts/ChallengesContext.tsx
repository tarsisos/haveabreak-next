import { createContext, ReactNode, useEffect, useState } from 'react';
import Cookies from 'js-cookie'
import challenges from '../../challenges.json'
import { LevelUpModal } from '../components/LevelUpModal';

interface Challenge {
  type: 'body' | 'eye';
  description: string;
  amount: number;
}

interface ChallengesContextData{
  level: number;
  currentExperience: number;
  experienceToTheNextLevel: number; 
  challengesCompleted: number;
  activeChallenge: Challenge;
  levelUp: ()=>void; 
  startNewChallenge: ()=>void;
  resetChallenge: ()=>void;
  completedChallenge: ()=> void;
  closeLevelUpModal: ()=> void;
}

interface ChallengesProviderProps {
  children: ReactNode;
  level: number;
  currentExperience: number;
  challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({
  children,
  ...rest //operador Rest Operator do JS: pega todas as propriedades
          //que não são children (level, currentExperience, challengesCompleted)
  }: ChallengesProviderProps){
  const [level, setLevel] = useState(rest.level ?? 1);
  const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0);
  const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);

  const [activeChallenge, setActiveChallenge]= useState(null)
  const [isLevelUpModalOpen, setIsLevelUpModalOpen ] = useState(false)

  const experienceToTheNextLevel = Math.pow((level+1) * 4, 2)

  useEffect(()=> {
    Notification.requestPermission()
  },[])

  useEffect(()=>{
    Cookies.set('level', String(level));
    Cookies.set('currentExperience', String(currentExperience));
    Cookies.set('challengesCompleted', String(challengesCompleted));
  },[level, currentExperience, challengesCompleted])

  function levelUp(){
    setLevel(level+1);
    setIsLevelUpModalOpen(true);
  }
  function closeLevelUpModal(){
    setIsLevelUpModalOpen(false);
  }

  function startNewChallenge(){
    const randomChallengeIndex = Math.floor(Math.random() * challenges.length)
    const challenge = challenges[randomChallengeIndex];
    setActiveChallenge(challenge)
    new Audio('/notification.mp3').play();
    if (Notification.permission == 'granted'){
      new Notification('Novo desafio 🎉', {
        body: `Valendo ${challenge.amount}xp!`
      })
    }
  }

  function resetChallenge(){
    setActiveChallenge(null);
  }

  function completedChallenge() {
    if(!activeChallenge){
      return;
    }
    const {amount} = activeChallenge;
    let finalExperience = currentExperience + amount;
    if(finalExperience >= experienceToTheNextLevel){
      finalExperience = finalExperience - experienceToTheNextLevel;
      levelUp();
    }
    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengesCompleted(challengesCompleted+1);
  }

  return(
    <ChallengesContext.Provider 
      value={{ 
        level, 
        levelUp, 
        currentExperience, 
        challengesCompleted,
        startNewChallenge,
        activeChallenge,
        resetChallenge,
        experienceToTheNextLevel,
        completedChallenge,
        closeLevelUpModal,
        }}
        >
      {children}
      
      {isLevelUpModalOpen && <LevelUpModal />} {/*uma forma de fazer if sem else*/}
    </ChallengesContext.Provider>
  );
}