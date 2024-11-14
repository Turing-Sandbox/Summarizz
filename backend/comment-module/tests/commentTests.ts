import { CommentService } from '../services/commentService';
import { Comment } from '../models/commentModel';

describe('CommentService', () => {
	let commentService: CommentService;

	beforeAll(() => {
		commentService = new CommentService();
	});

	afterAll(async () => {
		// Clean up any test data created during the tests
		await commentService.deleteComment('1');
		await commentService.deleteComment('2');
		await commentService.deleteComment('3');
	});

	it('should create a comment', async () => {
		const comment: Comment = {
			comment_id: '1',
			owner_id: 'user1',
			text: 'This is a test comment',
			timestamp: Date.now(),
		};
		await commentService.createComment(comment);
		const fetchedComment = await commentService.getComment('1');
		expect(fetchedComment).toEqual(comment);
	});

	it('should update a comment', async () => {
		const updatedComment = { text: 'Updated comment text' };
		await commentService.updateComment('1', updatedComment);
		const fetchedComment = await commentService.getComment('1');
		expect(fetchedComment?.text).toBe('Updated comment text');
	});

	it('should delete a comment', async () => {
		await commentService.deleteComment('1');
		const fetchedComment = await commentService.getComment('1');
		expect(fetchedComment).toBeNull();
	});

	it('should retrieve all comments', async () => {
		const comment1: Comment = {
			comment_id: '2',
			owner_id: 'user2',
			text: 'Another test comment',
			timestamp: Date.now(),
		};
		const comment2: Comment = {
			comment_id: '3',
			owner_id: 'user3',
			text: 'Yet another test comment',
			timestamp: Date.now(),
		};
		await commentService.createComment(comment1);
		await commentService.createComment(comment2);

		const allComments = await commentService.getAllComments();
		expect(allComments).toContainEqual(comment1);
		expect(allComments).toContainEqual(comment2);
	});
});
