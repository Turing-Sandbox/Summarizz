"use client";

import Navbar from "@/app/components/Navbar";
import { apiURL } from "@/app/scripts/api";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";

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
    content: string;
    thumbnail: string;
    // Add other fields as necessary
  }

  const [user, setUser] = useState<User | null>(null);
  const [contents, setContents] = useState<Content[]>([]);

  // INIT - Get the user info
  useEffect(() => {
    getUserInfo();
  }, []);

  // INIT - Get the user's content
  useEffect(() => {
    // Get the user's content
    if (user?.content) {
      for (let i = 0; i < user.content.length; i++) {
        console.log(user.content[i]);
        getContent(user.content[i]);
      }
    }
  }, [user]);

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

        <h2>Content</h2>
        {contents.map((content, index) => (
          <div key={content.id || index}>
            <h3>{content.title}</h3>
            <p>{content.content}</p>
            {/* Load thumbnail image from URL */}
            <Image
              src={content.thumbnail}
              alt='Thumbnail'
              width={200}
              height={200}
            />
          </div>
        ))}
      </div>
    </>
  );
}
