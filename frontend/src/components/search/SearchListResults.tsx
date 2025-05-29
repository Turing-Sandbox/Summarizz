import { Suspense, useEffect, useState } from "react";
import { User } from "../../models/User";
import { Content } from "../../models/Content";
import { useSearchParams } from "react-router-dom";
import ContentSearchResult from "./ContentSearchResult";
import UserSearchResult from "./UserSearchResult";
import { SearchService } from "../../services/SearchService";
import { useToast } from "../../hooks/ToastProvider/useToast";

function SearchListResults({
  userSearchResults,
  contentSearchResults,
}: {
  userSearchResults?: User[];
  contentSearchResults?: Content[];
} = {}) {
  // ---------------------------------------
  // -------------- Variables --------------
  // ---------------------------------------

  // Retrieve the search text from the url.
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const [usersReturned, setUsersReturned] = useState<User[]>([]);
  const [userDisabled, setUserDisabled] = useState(true);
  const [userStartingPoint, setUserStartingPoint] = useState<string | null>(
    null
  );

  const [contentReturned, setContentReturned] = useState<Content[]>([]);
  const [contentDisabled, setContentDisabled] = useState(true);
  const [contentStartingPoint, setContentStartingPoint] = useState<
    string | null
  >(null);

  const [fetching, setFetching] = useState(false);
  const toast = useToast();

  // ---------------------------------------
  // -------------- Page INIT --------------
  // ---------------------------------------

  // Fetch both user data and content data on first page load.
  useEffect(() => {
    if (userSearchResults) {
      setUsersReturned(userSearchResults);
    } else if (query) {
      fetchUserData();
    }

    if (contentSearchResults) {
      setContentReturned(contentSearchResults);
    } else if (query) {
      fetchContentData();
    }
  }, [userSearchResults, contentSearchResults, query]);

  /**
   * fetchUserData() -> void
   *
   * @description
   * Sends a GET request to the API endpoint for searching users.
   *
   * @returns void
   */
  const fetchUserData = async () => {
    if (!query) return;
    setFetching(true);

    const userSearchResults = await SearchService.searchUsers(
      query,
      userStartingPoint
    );

    if (userSearchResults instanceof Error) {
      toast("An error occurred while fetching user data.", "error");
      setFetching(false);
      return;
    }

    const users = userSearchResults.users || [];
    const existingUserIds = new Set(
      usersReturned.map((user: User) => user.uid)
    );

    // Filter out duplicate users
    const uniqueUsers = users.filter(
      (user: { uid: string }) => !existingUserIds.has(user.uid)
    );

    if (uniqueUsers && uniqueUsers.length > 0) {
      setUsersReturned((prev) => [...prev, ...uniqueUsers]);

      // Update the starting point for the next fetch
      setUserStartingPoint(uniqueUsers[uniqueUsers.length - 1]?.uid || null);

      // Enable or disable the "Fetch more" button based on the number of users
      setUserDisabled(!userSearchResults.nextStartingPoint);
    } else {
      setUserDisabled(true); // Disable the button if no unique users are found
    }

    setFetching(false);
  };

  /**
   * fetchUserData() -> void
   *
   * @description
   *Send a get request to the api endpoint for searching for articles.
   *
   * @returns void
   */
  const fetchContentData = async () => {
    if (!query) return;
    setFetching(true);

    const searchContentResults = await SearchService.searchContents(
      query,
      contentStartingPoint
    );

    if (searchContentResults instanceof Error) {
      toast("An error occurred while fetching content data.", "error");
      setFetching(false);
      return;
    }

    const contents = searchContentResults.contents || [];
    const existingContentIds = new Set(
      contentReturned.map((content: Content) => content.uid)
    );

    // Filter out duplicate users
    const uniqueContents = contents.filter(
      (content: { uid: string }) => !existingContentIds.has(content.uid)
    );

    if (uniqueContents && uniqueContents.length > 0) {
      setContentReturned((prev) => [...prev, ...uniqueContents]);

      // Update the starting point for the next fetch
      setContentStartingPoint(
        uniqueContents[uniqueContents.length - 1]?.uid || null
      );

      // Enable or disable the "Fetch more" button based on the number of contents
      setContentDisabled(!searchContentResults.nextStartingPoint);
    } else {
      setContentDisabled(true); // Disable the button if no unique content are found
    }

    setFetching(false);
  };

  return (
    <>
      <div className='searchResults'>
        {query && <h1>Search Results for: {query}</h1>}

        <h2>Users</h2>
        {usersReturned?.length === 0 ? (
          <p>No matching user found...</p>
        ) : (
          usersReturned.map((user: User, index) => (
            <div key={index} className='searchItem'>
              <UserSearchResult user={user} />
            </div>
          ))
        )}
        {fetching && <p>Loading...</p>}
        {!userDisabled && (
          <button className='fetchMoreButton' onClick={fetchUserData}>
            Fetch more users
          </button>
        )}

        <h2>Content</h2>
        {contentReturned?.length === 0 ? (
          <p>No matching content found...</p>
        ) : (
          contentReturned.map((content: Content, index) => (
            <div key={index} className='searchItem'>
              <ContentSearchResult content={content} />
            </div>
          ))
        )}
        {fetching && <p>Loading...</p>}
        {!contentDisabled && (
          <button className='fetchMoreButton' onClick={fetchContentData}>
            Fetch more contents
          </button>
        )}
      </div>
    </>
  );
}

const SearchList = (props: {
  userSearchResults?: User[];
  contentSearchResults?: Content[];
}) => {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchListResults {...props} />
    </Suspense>
  );
};

export default SearchList;
