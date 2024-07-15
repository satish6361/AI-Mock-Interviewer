'use client'
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { Textarea } from "@/components/ui/textarea"
import { chatSession } from '@/utils/GeminiAIModel'
import { LoaderCircle } from 'lucide-react'
import { MockInterview } from '@/utils/schema'
import {v4 as uuidv4} from 'uuid'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/db'
import moment from 'moment'
import { useRouter } from 'next/navigation'

function AddNewInterview() {
    const [openDialog, setOpenDialog] = useState(false);
    const [jobPosition, setJobPosition] = useState();
    const [jobDesc, setJobDesc] = useState()
    const [jobExperience, setJobExperience] = useState()
    const [loading, setLoading] = useState(false)
    const [jsonResponse, setJsonResponse] = useState([])
    const {user} = useUser();
    const router = useRouter();

    const handleSubmit = async(e) => {
        setLoading(true)
        e.preventDefault();
        // console.log(jobDesc, jobPosition, jobExperience)

        const InputPrompt = "Job Position: "+jobPosition+", Job Description: "+jobDesc+", Year of Experience: "+jobExperience+" depending upon job position, job description and year of experience generate "+process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT+" interview questions along with answer, as an excellent candidate would have answered, in a json format"

        const result = await chatSession.sendMessage(InputPrompt)
        console.log("AI Response: ", result.response.text())
        const MockJsonResponse = (result.response.text()).replace('```json','').replace('```', '')
        setJsonResponse(MockJsonResponse)
        console.log(JSON.parse(MockJsonResponse));
        
        if(MockJsonResponse){
            const resp = await db.insert(MockInterview)
            .values({
                mockId: uuidv4(),
                jsonMockResp: MockJsonResponse,
                jobPosition: jobPosition,
                jobDesc: jobDesc,
                jobExperience: jobExperience,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                createdAt: moment().format('DD-MM-YYYY')
            }).returning({mockId:MockInterview.mockId})

            // console.log("Inserted ID: ", resp)
            if(resp){
                setOpenDialog(false)
                router.push('/dashboard/interview/'+resp[0]?.mockId)
            }
        }
        else{
            console.log("Error")
        }
        
        setLoading(false)
    }
  return (
    <div>
        <div className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow cursor-pointer transition-all' onClick={()=> setOpenDialog(true)}>
            <h2 className='text-lg text-center'>+ Add New</h2>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                 <DialogContent className='max-w-2xl'>
                     <DialogHeader>
                         <DialogTitle className='text-2xl'>Tell us more about the job you are interviewing for</DialogTitle>
                         <DialogDescription>
                             
                         </DialogDescription>
                     </DialogHeader>
                     <form onSubmit={handleSubmit}>
                                 <h2>Add details about your job position, your skills, and years of experience</h2>
                                 <div>
                                     <div className='mt-7 my-3'>
                                         <label>Job Role/Job Position</label>
                                         <Input onChange={(e) => setJobPosition(e.target.value)} placeholder="Ex. Full Stack Developer" required />
                                     </div>
                                     <div className='mt-7 my-3'>
                                         <label>Job Description / Tech Stack (in short)</label>
                                         <Textarea onChange={(e) => setJobDesc(e.target.value)} placeholder="Ex. React, Angular, Express etc." required />
                                     </div>
                                     <div className='mt-7 my-3'>
                                         <label>Years of experience</label>
                                         <Input onChange={(e) => setJobExperience(e.target.value)} placeholder='Ex. 5' type='number' max="100" min="0" required />
                                     </div>
                                     <div className='flex gap-5 justify-end'>
                                         <Button type='button' variant='ghost' onClick={() => setOpenDialog(false)}>Cancel</Button>
                                         <Button type='submit' disabled = {loading}>
                                            {loading?
                                            <>
                                            <LoaderCircle className='animate-spin'/>Generating Questions from AI</>: 'Start Interview'}
                                            </Button>
                                     </div>
                                 </div>
                             </form>
                 </DialogContent>
             </Dialog>

    </div>
  )
}

export default AddNewInterview
