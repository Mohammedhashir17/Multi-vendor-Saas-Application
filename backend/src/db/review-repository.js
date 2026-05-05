import { ReviewModel } from './review.model.js';

export const createReview = (data) => ReviewModel.create(data);
export const listReviewsForProduct = (productId) =>
  ReviewModel.find({ productId }).populate('userId', 'name').sort({ createdAt: -1 }).lean();

export const findReviewByUserProduct = (userId, productId) => ReviewModel.findOne({ userId, productId });
