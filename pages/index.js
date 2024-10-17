import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';

// Function to find similar blocks (simplified version)
const findSimilarBlocks = (selectedBlock, allBlocks) => {
  return allBlocks.filter(block => block !== selectedBlock).slice(0, 3);
};

// Function to search Wikipedia
const searchWikipedia = async (query) => {
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=3&srsearch=${encodeURIComponent(query)}`;
  
  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.query.search.map(result => ({
      title: result.title,
      snippet: result.snippet.replace(/<\/?span[^>]*>/g, '')  // Remove HTML tags
    }));
  } catch (error) {
    console.error('Error fetching Wikipedia data:', error);
    return [];
  }
};

const Home = () => {
  const [file, setFile] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [similarBlocks, setSimilarBlocks] = useState([]);
  const [webResults, setWebResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const newBlocks = content.split('\n\n').filter(block => block.trim());
      setBlocks(newBlocks);
    };
    reader.readAsText(file);
  };

  const handleBlockClick = async (block) => {
    setIsLoading(true);
    setSelectedBlock(block);
    const similar = findSimilarBlocks(block, blocks);
    setSimilarBlocks(similar);
    
    try {
      const results = await searchWikipedia(block.substring(0, 100));
      setWebResults(results);
    } catch (error) {
      console.error('Error in web search:', error);
      setWebResults([]);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Markdown Similarity Search</h1>
      
      <Input type="file" onChange={handleFileChange} accept=".md" className="mb-4" />
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Markdown Blocks Section */}
        <div className="flex-1">
          <Card>
            <CardHeader className="text-lg font-semibold">Markdown Blocks</CardHeader>
            <CardContent>
              {blocks.map((block, index) => (
                <Button 
                  key={index} 
                  onClick={() => handleBlockClick(block)}
                  className="mb-2 w-full text-left hover:bg-gray-100 transition duration-200"
                >
                  {block.substring(0, 50)}...
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Analysis Results Section */}
        {selectedBlock && (
          <div className="flex-1">
            <Card>
              <CardHeader className="text-lg font-semibold">Analysis Results</CardHeader>
              <CardContent>
                <h3 className="font-bold mb-2">Selected Block:</h3>
                <p className="mb-4">{selectedBlock}</p>
                
                <h3 className="font-bold mb-2">Similar Blocks:</h3>
                {similarBlocks.map((block, index) => (
                  <Alert key={index} className="mb-2">
                    <AlertDescription>{block}</AlertDescription>
                  </Alert>
                ))}
                
                <h3 className="font-bold mb-2 mt-4">Wikipedia Results:</h3>
                {isLoading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : webResults.length > 0 ? (
                  webResults.map((result, index) => (
                    <Alert key={index} className="mb-2">
                      <AlertDescription>
                        <strong>{result.title}</strong>: {result.snippet}
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <p className="text-gray-500">No results found</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
