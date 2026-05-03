import type { RawUser, RawProduct } from '@/api/courses';
import type { Course, Instructor } from '@/types/course';

const TOPICS = [
  'Python', 'Java', 'React Native', 'Frontend Development', 'Backend Engineering',
  'Data Science', 'AI Agents', 'Machine Learning', 'Cybersecurity', 'Cloud Computing',
  'AWS Architecture', 'DevOps & CI/CD', 'Blockchain', 'UI/UX Design', 'Full-Stack JavaScript',
  'Node.js', 'Go Programming', 'Rust for Systems', 'iOS Swift', 'Android Kotlin'
];

const PREFIXES = [
  'The Complete', 'Mastering', 'Beginner\'s Guide to', 'Advanced', 'Zero to Hero:',
  'Hands-on', 'Practical', 'Essential', 'Modern', 'Accelerated'
];

const SUFFIXES = [
  'Bootcamp', 'Masterclass', 'Development', 'Engineering', 'Fundamentals',
  'Crash Course', 'Patterns & Practices', 'for Professionals', 'in 30 Days', 'Workshop'
];

const CATEGORIES = [
  'Programming', 'Data Science', 'Design', 'IT & Software', 'Business', 'Marketing'
];

const IMAGE_KEYWORDS = [
  'coding', 'developer', 'python', 'java', 'ai', 'computer', 'server', 'data', 'design', 'cloud'
];

function mapInstructor(u: RawUser): Instructor {
  return {
    id: u.login.uuid,
    name: `${u.name.first} ${u.name.last}`,
    avatar: u.picture?.large || 'https://via.placeholder.com/150',
    email: u.email,
    location: `${u.location.city}, ${u.location.country}`,
  };
}

// Generate a deterministic realistic course based on the product ID/Index
export function mergeCourses(users: RawUser[], products: RawProduct[]): Course[] {
  if (!products.length || !users.length) return [];

  return products.map((p, idx) => {
    const instructor = mapInstructor(users[idx % users.length]!);
    
    // Deterministic topic mapping
    const topicIdx = idx % TOPICS.length;
    const prefixIdx = (idx * 3) % PREFIXES.length;
    const suffixIdx = (idx * 7) % SUFFIXES.length;
    
    const topic = TOPICS[topicIdx];
    const title = `${PREFIXES[prefixIdx]} ${topic} ${SUFFIXES[suffixIdx]}`;
    
    // Realistic ratings between 4.0 and 5.0
    const rating = 4.0 + (idx % 11) * 0.1;
    
    // Deterministic price
    const price = 19.99 + (idx % 15) * 10;
    
    // Image fallback based on topic keyword
    const keyword = IMAGE_KEYWORDS[idx % IMAGE_KEYWORDS.length];
    // We use a realistic placeholder service that caches well and looks premium
    const thumbnail = `https://picsum.photos/seed/${p.id}/800/600`;

    const descStr = `Learn everything you need to know about ${topic}. This comprehensive course covers all the fundamentals, advanced techniques, and real-world projects to make you a complete expert. Perfect for beginners and experienced professionals alike.`;

    return {
      id: String(p.id),
      title,
      description: descStr,
      thumbnail,
      price,
      rating,
      category: String(CATEGORIES[idx % CATEGORIES.length]),
      stock: p.stock || 0,
      instructor,
      isBookmarked: false,
      isEnrolled: false,
      progress: 0,
    };
  });
}
