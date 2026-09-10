import React, { useState } from 'react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { LoaderCircle, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const CreateNewBoardDialogue = () => {

    const [workspaceName, setWorkspaceName] = useState("");
    const [loading, setLoading] = useState(false);
    const [dialogue, setDialogue] = useState(false);
    const route = useRouter()

    const handleCreateBoard = async () =>{
        if (workspaceName.trim() === "" || workspaceName?.length > 30){
            toast.add({
                title : "Invalid WorkSpace Name",
                type: "error",
                description: "Please Enter a valid workspace name (1 - 30 characters)"
            })

            return;
        }

        setLoading(true);
        const projectId = crypto.randomUUID();
        const result = await axios.post('/api/projects', {
            projectName : workspaceName,
            projectId: projectId,
        });

        console.log(result?.data);
        toast.add({
            type: "success",
            title: 'New Workspace Created'
        });

        setLoading(false);
        setDialogue(false);
        route.push('/workspace/' + projectId);
    }
  return (
    <Dialog open = {dialogue} onOpenChange={setDialogue}>
  <DialogTrigger>
        <Button className={"w-full"}>
            <Plus /> Create New Board
        </Button>
    </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className={"text-lg font-bold"}>White Board Workspace Name</DialogTitle>
      <div>
        <label className='text-gray-600'>Enter WhiteBoard workspace Name</label>
        < Input placeholder='Whitespace name' className='mt-1'
        onChange={(e) => setWorkspaceName(e.target.value)}
        />
      </div>
    </DialogHeader>

    <DialogFooter>
        < DialogClose>
            <Button variant={'outline'}> Cancel</Button>
        </DialogClose>
        <Button 
        disabled = {workspaceName?.length === 0 || loading}
        onClick={handleCreateBoard}>
            {loading && <LoaderCircle className='animate-spin' />}
            Create 
        </Button>
    </DialogFooter>
  </DialogContent>

    
</Dialog>
  )
}

export default CreateNewBoardDialogue