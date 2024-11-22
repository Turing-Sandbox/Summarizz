"use client";

import Navbar from "@/app/components/Navbar";
import "../styles/content.scss";
import { useEffect, useRef, useState } from "react";
import { apiURL } from "@/app/scripts/api";
import { Content } from "../models/Content";
import axios from "axios";
import { User } from "@/app/profile/models/User";
import Image from "next/image";

interface ViewContentProps {
  id: string;
}

export default function ViewContent({ id }: ViewContentProps) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);

  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------
  const hasFetchedData = useRef(false);
  useEffect(() => {
    if (!hasFetchedData.current) {
      getContent();
      //   getUserInfo();
      hasFetchedData.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  function getContent() {
    axios.get(`${apiURL}/content/${id}`).then((res) => {
      setContent(res.data);
    });
  }

  function getUserInfo() {
    if (content) {
      axios.get(`${apiURL}/user/${content.creatorUID}`).then((res) => {
        console.log(res.data);
        setCreator(res.data);
      });
    }
  }

  // --------------------------------------
  // -------------- Render ----------------
  // --------------------------------------
  return (
    <>
      <Navbar />
      <div className='main-content'>
        <h1>{content?.title}</h1>
        {/* <img src={user.profilePicture} alt='Profile Picture' /> */}

        <p>{creator?.username}</p>
        <p>{content?.content}</p>

        {content && (
          <Image
            src={content!.thumbnail}
            alt='Thumbnail'
            width={200}
            height={200}
          />
        )}
      </div>
    </>
  );
}
