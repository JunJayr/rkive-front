import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { useApplicationGenerateMutation } from '@/redux/features/authApiSlice';

interface ApplicationFormData {
  department: string;
  lead_researcher: string;
  lead_contactno: string;
  co_researcher1: string;
  co_researcher2: string;
  co_researcher3: string;
  co_researcher4: string;
  co_researcher5: string;
  research_title: string;
  datetime_defense: string;
  place_defense: string;
  panel_chair: string;
  adviser: string;
  panel1: string;
  panel2: string;
  panel3: string;
  documenter: string;
  [key: `co_researcher${number}`]: string;
  [key: `panel${number}`]: string;
}

const initialFormState: ApplicationFormData = {
  department: '',
  lead_researcher: '',
  lead_contactno: '',
  co_researcher1: '',
  co_researcher2: '',
  co_researcher3: '',
  co_researcher4: '',
  co_researcher5: '',
  research_title: '',
  datetime_defense: '',
  place_defense: '',
  panel_chair: '',
  adviser: '',
  panel1: '',
  panel2: '',
  panel3: '',
  documenter: '',
};

export default function useApplicationGeneration() {
  const [applicationGenerate, { isLoading }] = useApplicationGenerateMutation();
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Revoke old blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // Format the defense date into a readable string
      const formattedData: ApplicationFormData = {
        ...formData,
        datetime_defense: new Date(formData.datetime_defense).toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }),
      };

      const docUrl = await applicationGenerate(formattedData).unwrap();

      setPreviewUrl(docUrl);
      toast.success('Document generated successfully!');
    } catch (error: any) {
      console.error('Document generation failed:', error);
      toast.error('Failed to generate document. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = 'application_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    formData,
    isLoading,
    previewUrl, 
    handleChange,
    handleSubmit,
    handleDownload,
    setPreviewUrl,
  };
}
