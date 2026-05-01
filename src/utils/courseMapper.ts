import type { RawUser, RawProduct } from '@/api/courses';
import type { Course, Instructor } from '@/types/course';

function mapInstructor(u: RawUser): Instructor {
  return {
    id: u.login.uuid,
    name: `${u.name.first} ${u.name.last}`,
    avatar: u.picture.large,
    email: u.email,
    location: `${u.location.city}, ${u.location.country}`,
  };
}

// zip users + products; if counts differ, wrap around the shorter list
export function mergeCourses(users: RawUser[], products: RawProduct[]): Course[] {
  if (!products.length || !users.length) return [];

  return products.map((p, idx) => {
    const instructor = mapInstructor(users[idx % users.length]!);
    return {
      id: String(p.id),
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail || p.images[0] || '',
      price: p.price,
      rating: p.rating,
      category: p.category,
      stock: p.stock,
      instructor,
      isBookmarked: false,
      isEnrolled: false,
      progress: 0,
    };
  });
}
