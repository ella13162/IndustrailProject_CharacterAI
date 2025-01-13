import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateCharacterModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const AVATAR_SERVICES = {
  dicebear: {
    bottts: 'https://api.dicebear.com/7.x/bottts/svg?seed=',
    avataaars: 'https://api.dicebear.com/7.x/avataaars/svg?seed=',
    pixel: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=',
    lorelei: 'https://api.dicebear.com/7.x/lorelei/svg?seed=',
  }
};

interface AvatarOption {
  url: string;
  type: string;
  service: string;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing[6]};
  width: 90%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing[4]};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing[3]};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.sizes.base};
  min-height: 120px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
  margin-top: ${({ theme }) => theme.spacing[4]};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  flex: 1;

  ${({ $variant, theme }) =>
    $variant === 'primary'
      ? `
    background: ${theme.colors.primary};
    color: ${theme.colors.text.inverse};
    border: none;

    &:hover {
      opacity: 0.9;
    }
  `
      : `
    background: transparent;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};

    &:hover {
      background: ${theme.colors.surface};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  margin-top: ${({ theme }) => theme.spacing[1]};
`;

const ImageUploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const AvatarPreview = styled.div<{ $imageUrl: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-image: url(${props => props.$imageUrl});
  background-size: cover;
  background-position: center;
  border: 2px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    opacity: 0.8;
  }
`;

const UploadButton = styled.button`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }
`;

const CreateCharacterModal: React.FC<CreateCharacterModalProps> = ({
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([]);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [isGeneratingAvatars, setIsGeneratingAvatars] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const [isCustomImage, setIsCustomImage] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const imageRef = ref(storage, `characters/${fileName}`);

      // Upload with metadata
      const metadata = {
        customMetadata: {
          uploadedBy: currentUser.uid,
          uploadedAt: timestamp.toString(),
        }
      };

      // Upload file
      const uploadTask = uploadBytes(imageRef, file, metadata);
      
      // Wait for upload to complete
      await uploadTask;

      // Get download URL
      const downloadUrl = await getDownloadURL(imageRef);
      setImageUrl(downloadUrl);
      setIsCustomImage(true);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
      setImageUrl('');
    } finally {
      setLoading(false);
    }
  };

  const generateAvatarOptions = async (characterName: string, description: string) => {
    setIsGeneratingAvatars(true);
    try {
      // Generate avatar options using different services and styles
      const options: AvatarOption[] = [
        {
          url: `${AVATAR_SERVICES.dicebear.bottts}${characterName.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'Robot',
          service: 'DiceBear Bottts'
        },
        {
          url: `${AVATAR_SERVICES.dicebear.avataaars}${characterName.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'Human',
          service: 'DiceBear Avataaars'
        },
        {
          url: `${AVATAR_SERVICES.dicebear.pixel}${characterName.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'Pixel',
          service: 'DiceBear Pixel Art'
        },
        {
          url: `${AVATAR_SERVICES.dicebear.lorelei}${characterName.toLowerCase().replace(/\s+/g, '-')}`,
          type: 'Artistic',
          service: 'DiceBear Lorelei'
        }
      ];

      setAvatarOptions(options);
      setImageUrl(options[0].url);
    } catch (error) {
      console.error('Error generating avatars:', error);
    } finally {
      setIsGeneratingAvatars(false);
    }
  };

  // Update avatar options when name changes
  useEffect(() => {
    // Initialize with predefined avatar options
    const options: AvatarOption[] = [
      {
        url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot1',
        type: 'Robot 1',
        service: 'DiceBear'
      },
      {
        url: 'https://api.dicebear.com/7.x/bottts/svg?seed=robot2',
        type: 'Robot 2',
        service: 'DiceBear'
      },
      {
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=human1',
        type: 'Human 1',
        service: 'DiceBear'
      },
      {
        url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=human2',
        type: 'Human 2',
        service: 'DiceBear'
      },
      {
        url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel1',
        type: 'Pixel 1',
        service: 'DiceBear'
      },
      {
        url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel2',
        type: 'Pixel 2',
        service: 'DiceBear'
      },
      {
        url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=art1',
        type: 'Art 1',
        service: 'DiceBear'
      },
      {
        url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=art2',
        type: 'Art 2',
        service: 'DiceBear'
      }
    ];
    setAvatarOptions(options);
    if (!imageUrl) {
      setImageUrl(options[0].url);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || loading) return;

    if (!name.trim() || !description.trim() || !systemMessage.trim()) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const charactersRef = collection(db, 'characters');
      const docRef = await addDoc(charactersRef, {
        name: name.trim(),
        description: description.trim(),
        systemMessage: systemMessage.trim(),
        imageUrl: imageUrl || avatarOptions[selectedAvatarIndex]?.url,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        isCustom: true,
      });

      // Update the document with its own ID
      await updateDoc(docRef, {
        id: docRef.id
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error('Error creating character:', error);
      if (error instanceof Error) {
        setError(
          error.message.includes('permission') 
            ? 'You do not have permission to create characters. Please try logging out and back in.'
            : 'Failed to create character. Please try again.'
        );
      } else {
        setError('Failed to create character. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Title>Create Custom Character</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Character Image</Label>
            <ImageUploadContainer>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <AvatarPreview 
              $imageUrl={imageUrl || avatarOptions[selectedAvatarIndex]?.url}
              onClick={handleImageClick}
              title="Click to upload custom image"
            />
            {avatarOptions.length > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem', 
                padding: '0.5rem',
                maxWidth: '100%',
                position: 'relative'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    const newIndex = selectedAvatarIndex === 0 ? avatarOptions.length - 1 : selectedAvatarIndex - 1;
                    setSelectedAvatarIndex(newIndex);
                    if (!isCustomImage) {
                      setImageUrl(avatarOptions[newIndex].url);
                    }
                  }}
                  style={{
                    background: '#fe6602',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '18px',
                    padding: 0,
                    zIndex: 1
                  }}
                >
                  ←
                </button>
                <div style={{ 
                  display: 'flex',
                  gap: '0.5rem',
                  overflowX: 'hidden',
                  maxWidth: 'calc(100% - 64px)',
                  margin: '0 8px'
                }}>
                  {avatarOptions.map((option, index) => (
                    <div
                      key={option.type}
                      onClick={() => {
                        setSelectedAvatarIndex(index);
                        if (!isCustomImage) {
                          setImageUrl(option.url);
                        }
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `url(${option.url}) center/cover`,
                        cursor: 'pointer',
                        border: index === selectedAvatarIndex ? '2px solid #fe6602' : '2px solid #d0d5dd',
                        opacity: index === selectedAvatarIndex ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}
                      title={`${option.type} style by ${option.service}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newIndex = selectedAvatarIndex === avatarOptions.length - 1 ? 0 : selectedAvatarIndex + 1;
                    setSelectedAvatarIndex(newIndex);
                    if (!isCustomImage) {
                      setImageUrl(avatarOptions[newIndex].url);
                    }
                  }}
                  style={{
                    background: '#fe6602',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '18px',
                    padding: 0,
                    zIndex: 1
                  }}
                >
                  →
                </button>
              </div>
            )}
          </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <UploadButton 
                type="button" 
                onClick={() => {
                  handleImageClick();
                  setIsCustomImage(true);
                }} 
                disabled={loading}
                style={{
                  background: '#fe6602',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontFamily: 'Poppins',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'opacity 0.2s ease',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? `Uploading... ${uploadProgress}%` : 'Upload Custom Image'}
              </UploadButton>
            </ImageUploadContainer>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Character name"
              maxLength={50}
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of the character"
              maxLength={200}
              disabled={loading}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="systemMessage">Personality & Behavior</Label>
            <TextArea
              id="systemMessage"
              value={systemMessage}
              onChange={e => setSystemMessage(e.target.value)}
              placeholder="Detailed instructions for how the character should behave, speak, and interact"
              disabled={loading}
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <ButtonGroup>
            <Button type="button" onClick={onClose} $variant="secondary" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" $variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Character'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default CreateCharacterModal;
