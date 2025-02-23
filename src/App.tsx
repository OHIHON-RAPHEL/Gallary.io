import axios from 'axios';
import { useCallback, useRef, useState, useEffect } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';

const API_URL = 'https://api.unsplash.com/search/photos';
const IMAGE_PER_PAGE = 20;

interface ImageData {
  id: string;
  urls: { small: string; regular: string };
  alt_description: string;
  user: { name: string };
  tags?: { title: string }[];
}


const App: React.FC = () => {
  const searchInput = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showError, setShowError] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const fetchImages = useCallback(async (): Promise<void> => {
    try {
      if (!searchInput.current) return;
      setErrorMsg("");
      setShowError(false);
      const { data } = await axios.get<{ results: ImageData[]; total_pages: number }>(
        `${API_URL}?query=${searchInput.current.value}&page=${page}&per_page=${IMAGE_PER_PAGE}`,
        {
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_API_KEY}`,
          },
        }
      );
      setImages(data.results);
      setTotalPages(data.total_pages);
    } catch (error) {
      setErrorMsg('Error fetching images. Try again later');
      setShowError(true);
      console.error('Fetch error:', error);
    }
  }, [page]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const resetSearch = () => {
    setPage(1);
    setHasSearched(true);
    fetchImages();
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchInput.current) {
      resetSearch();
    }
  };

  const handleSelection = (selection: string) => {
    if (searchInput.current) {
      searchInput.current.value = selection;
      resetSearch();
    }
  };

  const openModal = (image: ImageData) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-[#e0e0e0]'>
      <h1 className='text-[#3B82F6] mb-4'>Image Search</h1>
      {showError && hasSearched && <p className='text-red-400 font-bold'>{errorMsg}</p>}
      <div className='w-[28rem]'>
        <Form onSubmit={handleSearch}>
          <Form.Control type='search' placeholder='Type something to search...' ref={searchInput} className='p-2' />
        </Form>
      </div>
      <div className='mt-4 flex gap-3 text-white'>
        {['Nature', 'Birds', 'Cats', 'Shoes'].map((category) => (
          <div key={category} onClick={() => handleSelection(category.toLowerCase())} className='bg-blue-600 p-[4px_8px] rounded cursor-pointer'>
            {category}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-5 p-[50px_86px] gap-4'>
        {images.map((image) => (
          <div key={image.id} className='bg-white p-2 rounded-lg shadow-md flex flex-col items-center cursor-pointer' onClick={() => openModal(image)}>
            <img src={image.urls.small} alt={image.alt_description || 'Image'} className='w-full object-cover h-60 rounded-lg' />
            <p className='mt-2 font-semibold'>{image.alt_description || 'Untitled'}</p>
            <p className='text-sm text-gray-600'>By {image.user.name}</p>
          </div>
        ))}
      </div>
      <div className='flex gap-4 mb-5'>
        {page > 1 && <button onClick={() => setPage(page - 1)} className='bg-blue-600 p-[4px_8px] rounded text-white'>Previous</button>}
        {page < totalPages && <button onClick={() => setPage(page + 1)} className='bg-blue-600 p-[4px_8px] rounded text-white'>Next</button>}
      </div>
      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedImage?.alt_description || 'Image Details'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
          <img src={selectedImage?.urls.regular} alt={selectedImage?.alt_description} className='w-full rounded-lg' />
          <p className='mt-2 text-sm text-gray-600'>By {selectedImage?.user.name}</p>
          {selectedImage?.tags && (
            <div className='mt-2'>
              <strong>Tags:</strong> {selectedImage.tags.map(tag => tag.title).join(', ')}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;
