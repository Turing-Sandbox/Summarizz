"use client";

import Navbar from "@/app/components/Navbar";
import { useEffect, useRef, useState } from "react";
import { apiURL } from "@/app/scripts/api";
import { Content } from "../models/Content";
import axios from "axios";
import { User } from "@/app/profile/models/User";
import Image from "next/image";
import "../styles/viewContent.scss";
import DOMPurify from "dompurify";

interface ViewContentProps {
  id: string;
}

export default function ViewContent({ id }: ViewContentProps) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [formatedContent, setFormatedContent] = useState<string | null>(null);

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
    if (content) {
      const sanitizedContent = DOMPurify.sanitize(content.content);
      setFormatedContent(sanitizedContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // ---------------------------------------
  // -------------- Functions --------------
  // ---------------------------------------
  function getContent() {
    axios.get(`${apiURL}/content/${id}`).then((res) => {
      const fetchedContent = res.data;

      // Convert Firestore Timestamp to JavaScript Date
      if (fetchedContent.dateCreated && fetchedContent.dateCreated.seconds) {
        fetchedContent.dateCreated = new Date(
          fetchedContent.dateCreated.seconds * 1000
        );
      } else {
        fetchedContent.dateCreated = new Date(fetchedContent.dateCreated);
      }

      fetchedContent.id = id;
      setContent(fetchedContent);
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
        <div className='row'>
          <div className='col-2'>
            {content && content.thumbnail && (
              <Image
                src={content!.thumbnail}
                alt='Thumbnail'
                width={200}
                height={200}
                className='thumbnail'
              />
            )}

            {/* TODO: DISCUSSION/CHAT */}
          </div>

          <div className='col-1'>
            <h1>{content?.title}</h1>

            <div className='content-header'>
              <div className='content-info'>
                {/* TODO: TAGS */}
                <p>
                  {content?.dateCreated?.toLocaleDateString()}
                  {content?.readtime ? ` - ${content.readtime} min` : ""}
                </p>
                <p>{creator?.username}</p>

                {creator && creator.profileImage && (
                  <Image
                    src={creator.profileImage}
                    width={50}
                    height={50}
                    alt='Profile Picture'
                  />
                )}
              </div>

              <div className='spliter'></div>

              <div className='content-summary'>
                <p>Article Summary</p>
              </div>
            </div>
            {formatedContent ? (
              <div dangerouslySetInnerHTML={{ __html: formatedContent }} />
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </>
  );
}
