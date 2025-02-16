// export interface User {
//     username: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     uid: string;
//     bio?: string;
//     profileImage?: string;
//     content?: string[];
//     isPrivate?: boolean;
//     followedCreators?: string[];
//     followedBy?: string[];
//     followRequests?: string[];
// }

// export interface Content {
//     id: string;
//     creatorUID: string;
//     dateCreated: Date;
//     dateUpdated: Date;
//     title: string;
//     content: string;
//     thumbnail?: string;
//     readtime?: number;
//     likes?: number;
//     peopleWhoLiked?: string[];
//     bookmarkedBy?: string[];
// }

declare module '*.svg' {
    const content: Icon;
    export default content;
}

declare module '*.png' {
    const content: Icon;
    export default content;
}

declare module '*.jpg' {
    const content: Icon;
    export default content;
}

declare module "*.jpeg" {
    const content: Icon;
    export default content;
}

// ANCHOR - This is going to play a big role in the refactoring future!
// ANCHOR - Summarizz 2025