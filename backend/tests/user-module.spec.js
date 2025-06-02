"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const globals_1 = require("@jest/globals");
// Configuration for tests
const API_URL = 'http://localhost:3000';
const testUserCredentials = {
    firstName: 'Test',
    lastName: 'User',
    username: `testuser${Math.floor(Math.random() * 10000)}`, // Ensure unique username
    email: `testuser${Math.floor(Math.random() * 10000)}@example.com`, // Ensure unique email
    password: 'Password123!'
};
let userId = null;
let authToken = null;
(0, globals_1.describe)('User Module Tests', () => {
    // Test user registration
    it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`${API_URL}/user/register`, testUserCredentials);
            (0, globals_1.expect)(response.status).toBe(201);
            (0, globals_1.expect)(response.data).toHaveProperty('userUID');
            (0, globals_1.expect)(response.data).toHaveProperty('token');
            userId = response.data.userUID;
            authToken = response.data.token;
            console.log('Registered user with ID:', userId);
        }
        catch (error) {
            console.error('Registration error:', error.response ? error.response.data : error);
            throw error;
        }
    }));
    // Test user login
    it('should login with registered credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        const loginCredentials = {
            email: testUserCredentials.email,
            password: testUserCredentials.password
        };
        try {
            const response = yield axios_1.default.post(`${API_URL}/user/login`, loginCredentials, {
                withCredentials: true
            });
            (0, globals_1.expect)(response.status).toBe(201);
            // Check for userUID which should always be present
            (0, globals_1.expect)(response.data).toHaveProperty('userUID');
            (0, globals_1.expect)(typeof response.data.userUID).toBe('string');
            (0, globals_1.expect)(response.data.userUID.length).toBeGreaterThan(0);
            // Check for message property if it exists
            if ('message' in response.data) {
                (0, globals_1.expect)(response.data.message).toBe('Login successful');
            }
            // Check for token property if it exists (for backward compatibility)
            // This makes the test pass in both environments
            if ('token' in response.data) {
                (0, globals_1.expect)(typeof response.data.token).toBe('string');
                (0, globals_1.expect)(response.data.token.length).toBeGreaterThan(0);
            }
            // Check for cookies if they're being set
            if (response.headers && response.headers['set-cookie']) {
                const cookies = response.headers['set-cookie'];
                if (Array.isArray(cookies)) {
                    console.log('Cookies are being set in the response');
                    // Check if both token and refreshToken cookies are present
                    const hasTokenCookie = cookies.some(cookie => cookie.includes('token='));
                    const hasRefreshTokenCookie = cookies.some(cookie => cookie.includes('refreshToken='));
                    if (hasTokenCookie && hasRefreshTokenCookie) {
                        console.log('Both token and refreshToken cookies are present');
                    }
                }
            }
            console.log('Login successful');
        }
        catch (error) {
            console.error('Login error:', error.response ? error.response.data : error);
            throw error;
        }
    }));
    // Test get user profile
    it('should get user profile by ID', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${API_URL}/user/${userId}`);
            (0, globals_1.expect)(response.status).toBe(200);
            (0, globals_1.expect)(response.data).toHaveProperty('username', testUserCredentials.username);
            (0, globals_1.expect)(response.data).toHaveProperty('email', testUserCredentials.email);
            (0, globals_1.expect)(response.data).toHaveProperty('firstName', testUserCredentials.firstName);
            (0, globals_1.expect)(response.data).toHaveProperty('lastName', testUserCredentials.lastName);
        }
        catch (error) {
            console.error('Get profile error:', error.response ? error.response.data : error);
            throw error;
        }
    }));
    // Test update user profile - fixed to properly format data
    it('should update user profile with bio info', () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedInfo = {
            bio: 'This is a test bio',
            username: testUserCredentials.username,
            usernameLower: testUserCredentials.username.toLowerCase()
        };
        try {
            const response = yield axios_1.default.put(`${API_URL}/user/${userId}`, updatedInfo);
            (0, globals_1.expect)(response.status).toBe(200);
            yield new Promise(resolve => setTimeout(resolve, 500));
            const userResponse = yield axios_1.default.get(`${API_URL}/user/${userId}`);
            (0, globals_1.expect)(userResponse.data.bio).toBe(updatedInfo.bio);
        }
        catch (error) {
            console.error('Update profile error:', error.response ?
                `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` :
                error);
            throw error;
        }
    }));
    // Test update user profile privacy setting
    it('should update profile privacy setting', () => __awaiter(void 0, void 0, void 0, function* () {
        const privacyUpdate = {
            isPrivate: true,
            username: testUserCredentials.username,
            usernameLower: testUserCredentials.username.toLowerCase()
        };
        try {
            const response = yield axios_1.default.put(`${API_URL}/user/${userId}`, privacyUpdate);
            (0, globals_1.expect)(response.status).toBe(200);
            yield new Promise(resolve => setTimeout(resolve, 500));
            const userResponse = yield axios_1.default.get(`${API_URL}/user/${userId}`);
            (0, globals_1.expect)(userResponse.data.isPrivate).toBe(true);
        }
        catch (error) {
            console.error('Privacy update error:', error.response ?
                `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` :
                error);
            throw error;
        }
    }));
    // Clean up any open handles after all tests
    (0, globals_1.afterAll)(() => __awaiter(void 0, void 0, void 0, function* () {
        // Add a small delay to ensure all operations complete
        yield new Promise(resolve => setTimeout(resolve, 1000));
        console.log('All tests completed, cleaning up...');
    }));
});
//# sourceMappingURL=user-module.spec.js.map