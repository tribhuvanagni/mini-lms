jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'medium' },
}));

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="expo-image" {...props} />,
  };
});

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => <View {...props} />,
  };
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CourseCard } from '../../src/components/CourseCard';
import type { Course } from '../../src/types/course';

const makeCourse = (overrides: Partial<Course> = {}): Course => ({
  id: 'c1',
  title: 'React Native Masterclass',
  description: 'Learn RN from scratch',
  thumbnail: 'https://example.com/thumb.jpg',
  price: 49.99,
  rating: 4.5,
  category: 'Mobile Development',
  stock: 100,
  instructor: {
    id: 'i1',
    name: 'Jane Doe',
    avatar: 'https://example.com/avatar.jpg',
    email: 'jane@example.com',
    location: 'San Francisco',
  },
  isBookmarked: false,
  isEnrolled: false,
  progress: 0,
  ...overrides,
});

describe('CourseCard', () => {
  const onPress = jest.fn();
  const onBookmark = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders title and description', () => {
    const course = makeCourse();
    const { getByText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} />
    );

    expect(getByText('React Native Masterclass')).toBeTruthy();
    expect(getByText('Learn RN from scratch')).toBeTruthy();
  });

  it('renders instructor name', () => {
    const course = makeCourse();
    const { getByText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} />
    );

    expect(getByText('Jane Doe')).toBeTruthy();
  });

  it('renders category badge', () => {
    const course = makeCourse();
    const { getByText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} />
    );

    expect(getByText('Mobile Development')).toBeTruthy();
  });

  it('renders price', () => {
    const course = makeCourse({ price: 29.99 });
    const { getByText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} />
    );

    expect(getByText('$29.99')).toBeTruthy();
  });

  it('shows filled bookmark icon (★) when bookmarked', () => {
    const course = makeCourse({ isBookmarked: true });
    const { getByText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} />
    );

    expect(getByText('★')).toBeTruthy();
  });

  it('shows empty bookmark icon (☆) when not bookmarked', () => {
    const course = makeCourse({ isBookmarked: false });
    const { getByText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} />
    );

    expect(getByText('☆')).toBeTruthy();
  });

  it('renders star rating with numeric value', () => {
    const course = makeCourse({ rating: 4.0 });
    const { getByText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} />
    );

    // Rating row renders as "★★★★☆ 4.0"
    expect(getByText(/4\.0/)).toBeTruthy();
  });

  it('renders remove button when showRemoveButton is true', () => {
    const course = makeCourse({ isBookmarked: true });
    const { getByText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} showRemoveButton />
    );

    expect(getByText('Remove from Bookmarks')).toBeTruthy();
  });

  it('has correct accessibility label', () => {
    const course = makeCourse();
    const { getByLabelText } = render(
      <CourseCard course={course} onPress={onPress} onBookmark={onBookmark} />
    );

    expect(getByLabelText('React Native Masterclass, by Jane Doe')).toBeTruthy();
  });
});
