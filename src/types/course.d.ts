// we build this from randomusers + randomproducts
export interface Instructor {
  id: string;
  name: string;
  avatar: string;
  email: string;
  location: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  rating: number;
  category: string;
  stock: number; // repurposed as "seats available"
  instructor: Instructor;
  // local state — not from API
  isBookmarked: boolean;
  isEnrolled: boolean;
  enrolledAt?: string;
  progress: number; // 0-100
}

export type CoursePreview = Pick<
  Course,
  'id' | 'title' | 'thumbnail' | 'instructor' | 'rating' | 'category' | 'isBookmarked'
>;
