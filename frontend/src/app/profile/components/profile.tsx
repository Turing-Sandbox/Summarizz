"use client";

import Navbar from "@/app/components/Navbar";
import { apiURL } from "@/app/scripts/api";
import axios from "axios";
import { useEffect, useState } from "react";

interface ProfileProps {
  id: string;
}

export default function Profile({ id }: ProfileProps) {
  interface User {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    uid: string;
    bio?: string;
    profilePicture?: string;
    content?: string[];
    // Add other fields as necessary
  }

  interface Content {
    id: string;
    title: string;
    description: string;
    // Add other fields as necessary
  }

  const [user, setUser] = useState<User | null>(null);
  const [contents, setContents] = useState<Content[]>([]);

  function init() {
    getUserInfo();

    // Get the user's content
    if (user?.content) {
      for (let i = 0; i < user?.content?.length; i++) {
        getContent(user.content[i]);
      }
    }
  }

  useEffect(() => {
    init();
  }, []);

  function getUserInfo() {
    // Get the user info
    axios.get(`${apiURL}/user/${id}`).then((res) => {
      console.log(res.data);
      setUser(res.data);
    });
  }

  function getContent(contentId: string) {
    axios.get(`${apiURL}/content/${contentId}`).then((res) => {
      setContents([...contents, res.data]);
    });
  }

  return (
    <>
      <Navbar />
      <div className='main-content'>
        <h1>Profile</h1>
        <p>{user?.username}</p>
        <p>{user?.firstName}</p>
        <p>{user?.lastName}</p>
        <p>{user?.email}</p>
        <p>{user?.bio}</p>
        {/* <img src={user.profilePicture} alt='Profile Picture' /> */}
      </div>
    </>
  );
}
