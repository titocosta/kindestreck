import { Ionicons } from '@expo/vector-icons';


export type Data = {
  id: number;
  image?: any;
  icon?: any;
  title: string;
  text: string;
};

export const data: Data[] = [
  {
    id: 1,
    icon: <Ionicons name="cloud-upload-outline" size={180} color="black" />,
    title: 'Upload your PDFs and documents',
    text: 'Our AI will help you extract key information on the go.',
  },
  {
    id: 2,
    icon: <Ionicons name="camera-outline" size={180} color="black" />,
    title: 'Take screenshots',
    text: 'Use OpenIndex.ai to organize and extract text from your screenshots.',
  },
  {
    id: 3,
    icon: <Ionicons name="chatbox-outline" size={180} color="black" />,
    title: 'Chat with your documents',
    text: 'Use our chatbot to search and find your documents.',
  },
];
