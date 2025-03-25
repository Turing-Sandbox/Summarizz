import axios from "axios";
import { describe, expect } from "@jest/globals";

// Configuration for tests
const API_URL = 'http://localhost:3000';
const testUserCredentials = {
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${Math.floor(Math.random() * 10000)}`, // Ensure unique username
    email: `testuser${Math.floor(Math.random() * 10000)}@example.com`, // Ensure unique email
    password: 'Password123!'
};

let userId: string | null = null;
let authToken: string | null = null;

describe('User Module Tests', () => {
    // Test user registration
    it('should register a new user', async () => {
        try {
            const response = await axios.post(`${API_URL}/user/register`, testUserCredentials);

            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('userUID');
            expect(response.data).toHaveProperty('token');

            userId = response.data.userUID;
            authToken = response.data.token;

            console.log('Registered user with ID:', userId);
        } catch (error: any) {
            console.error('Registration error:', error.response ? error.response.data : error);
            throw error;
        }
    });

    // Test user login
    it('should login with registered credentials', async () => {
        const loginCredentials = {
            email: testUserCredentials.email,
            password: testUserCredentials.password
        };

        try {
            const response = await axios.post(`${API_URL}/user/login`, loginCredentials);

            expect(response.status).toBe(201);
            expect(response.data).toHaveProperty('userUID');
            expect(response.data).toHaveProperty('token');
            expect(response.data.userUID).toBe(userId);
        } catch (error: any) {
            console.error('Login error:', error.response ? error.response.data : error);
            throw error;
        }
    });

    // Test get user profile
    it('should get user profile by ID', async () => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`);

            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('username', testUserCredentials.username);
            expect(response.data).toHaveProperty('email', testUserCredentials.email);
            expect(response.data).toHaveProperty('firstName', testUserCredentials.firstName);
            expect(response.data).toHaveProperty('lastName', testUserCredentials.lastName);
        } catch (error: any) {
            console.error('Get profile error:', error.response ? error.response.data : error);
            throw error;
        }
    });

    // Test update user profile - fixed to properly format data
    it('should update user profile with bio info', async () => {
        const updatedInfo = {
            bio: 'This is a test bio',
            username: testUserCredentials.username,
            usernameLower: testUserCredentials.username.toLowerCase()
        };

        try {
            const response = await axios.put(`${API_URL}/user/${userId}`, updatedInfo);

            expect(response.status).toBe(200);
            await new Promise(resolve => setTimeout(resolve, 500));
            const userResponse = await axios.get(`${API_URL}/user/${userId}`);

            expect(userResponse.data.bio).toBe(updatedInfo.bio);
        } catch (error: any) {
            console.error('Update profile error:',
                error.response ?
                    `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` :
                    error
            );
            throw error;
        }
    });

    // Test update user profile privacy setting
    it('should update profile privacy setting', async () => {
        const privacyUpdate = {
            isPrivate: true,
            username: testUserCredentials.username,
            usernameLower: testUserCredentials.username.toLowerCase()
        };

        try {
            const response = await axios.put(`${API_URL}/user/${userId}`, privacyUpdate);

            expect(response.status).toBe(200);
            await new Promise(resolve => setTimeout(resolve, 500));
            const userResponse = await axios.get(`${API_URL}/user/${userId}`);

            expect(userResponse.data.isPrivate).toBe(true);
        } catch (error: any) {
            console.error('Privacy update error:',
                error.response ?
                    `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` :
                    error
            );
            throw error;
        }
    });
});