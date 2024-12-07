import { Comment } from '../models/Comment'
import {useEffect, useState} from "react";
import axios from "axios";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/solid";

interface CommentProp {
    comment: Comment;
}

export default function CommentComponent ({comment}: CommentProp){
    // const [username, setUsername] = useState("");

    useEffect(() => {

        async function getUserData () {
            const response = await axios.get(`user/${comment.owner_id}`)
            console.log("User: ", response.data())
        }

        getUserData().then(r => {
            console.log("request")
            console.log(r)
            console.log("request")
        })

    }, []);

    return (
        <>
        </>
    )
}