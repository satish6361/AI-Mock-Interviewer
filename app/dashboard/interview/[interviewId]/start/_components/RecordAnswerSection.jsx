'use client'
import { Button } from '@/components/ui/button'
import React, { useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import useSpeechToText from 'react-hook-speech-to-text';
import { Mic, StopCircle } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModel';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';

function RecordAnswerSection({mockInterviewQuestions, activeQuestionIndex, interviewData}) {
    const [userAnswer, setUserAnswer] = useState('');
    const {user} = useUser();
    const [loading, setLoading] = useState(false);

    const {
        error,
        interimResult,
        isRecording,
        results,
        startSpeechToText,
        stopSpeechToText,
        setResults
      } = useSpeechToText({
        continuous: true,
        useLegacyResults: false
    });

    useEffect(() => {
        results.map((result) => (
            setUserAnswer(prevAns => prevAns + result?.transcript)
        ))
    },[results])

    useEffect(() => {
        if(!isRecording && userAnswer.length > 10){
            updateUserAnswer();
        }
    }, [userAnswer])


    const StartStopRecording = async () => {
        if(isRecording){
            stopSpeechToText();
            
        } else{
            startSpeechToText();
        }
    }
    const updateUserAnswer = async () => {
        console.log(userAnswer)
        setLoading(true)
        const feedbackPrompt = "Question:"+mockInterviewQuestion[activeQuestionIndex]?.question+", User Answer:"+userAnswer+", Depends on question and user answer for give interview question"+
            "Please, give us rating for answer and feedback as area of improvement if any"+
            "in just 3 to 5 lines to improve it in json format with rating field and feedback field"

            const result = await chatSession.sendMessage(feedbackPrompt);
            const mockJsonResp = (result.response.text()).replace('```json','').replace('```', '')
            setJsonResponse(MockJsonResponse);

            console.log("After FeedBack: ", mockJsonResp)

            const JsonFeedbackResp = JSON.parse(mockJsonResp)
            const resp = await db.insert(UserAnswer)
            .values({
                mockIdRef: interviewData?.mockId,
                question: mockInterviewQuestion[activeQuestionIndex]?.question,
                correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
                userAns: userAnswer,
                feedback: JsonFeedbackResp?.feedback,
                rating: JsonFeedbackResp?.rating,
                userEmail: user?.primaryEmailAddress.emailAddress,
                createdAt: moment().format('DD-MM-YYYY')
            })

            if(resp){
                toast("User answer recorded successfully");
                setUserAnswer('')
                setResults([]);
            }
            setResults([]);
            setLoading(false);
    }
  return (
    <div className='flex flex-col items-center justify-center'>

        <div className='flex flex-col my-20 justify-center items-center rounded-lg p-5 bg-black'>
            <img src={'/webcam.png'} width={200} height={200} className='absolute'/>
            <Webcam 
            mirrored={true}
            style={{
                height: 300,
                width: '100%',
                zIndex: 10

            }}
            />
        </div>
        <Button 
        disabled={loading}
        variant="outline" className="my-10"
        onClick={StartStopRecording}>
        {isRecording?
            <h2 className='text-red-600 animate-pulse flex gap-2 items'>
                <StopCircle />Stop Recording
            </h2>
            :
            <h2 className='text-primary flex gap-2 items-center'>
                <Mic />Record Answer
            </h2>
        }</Button>
{/*         
        <Button onClick={() => console.log(userAnswer)}>Show User Answr</Button> */}
    </div>
  )
}

export default RecordAnswerSection