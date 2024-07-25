import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const fetchTopStories = async () => {
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const storyIds = await response.json();
  return storyIds.slice(0, 100);
};

const fetchStory = async (id) => {
  const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
  return response.json();
};

const StoryItem = ({ story }) => (
  <div className="border-b border-gray-200 py-4">
    <h2 className="text-lg font-semibold">{story.title}</h2>
    <div className="flex justify-between items-center mt-2">
      <span className="text-sm text-gray-500">Upvotes: {story.score}</span>
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        Read more
      </a>
    </div>
  </div>
);

const SkeletonItem = () => (
  <div className="border-b border-gray-200 py-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="flex justify-between items-center mt-2">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
);

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: storyIds, isLoading: isLoadingIds } = useQuery(['topStories'], fetchTopStories);
  const { data: stories, isLoading: isLoadingStories } = useQuery(
    ['stories', storyIds],
    async () => {
      if (storyIds) {
        const storyPromises = storyIds.map(id => fetchStory(id));
        return Promise.all(storyPromises);
      }
      return [];
    },
    {
      enabled: !!storyIds,
    }
  );

  const filteredStories = stories?.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Top 100 Hacker News Stories</h1>
      <div className="mb-6 flex">
        <Input
          type="text"
          placeholder="Search stories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow mr-2"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      {isLoadingIds || isLoadingStories ? (
        Array(10).fill().map((_, index) => <SkeletonItem key={index} />)
      ) : (
        filteredStories?.map(story => <StoryItem key={story.id} story={story} />)
      )}
    </div>
  );
};

export default Index;
