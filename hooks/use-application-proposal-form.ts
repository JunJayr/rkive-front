import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-toastify';
import {
  useProposalGenerateMutation,
  useGetFacultyQuery,
} from '@/redux/features/authApiSlice';

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

  // ✅ NUMERIC IDs (same as PanelForm)
  adviser: number;
  panel_chair: number;
  panel1: number;
  panel2: number;
  panel3: number;

  documenter: string;
  
  [key: `co_researcher${number}`]: string;
  [key: `panel${number}`]: number;
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
  adviser: 0,
  panel_chair: 0,
  panel1: 0,
  panel2: 0,
  panel3: 0,
  documenter: '',
};

export default function useApplicationGeneration() {
  const [proposalGenerate, { isLoading }] =
    useProposalGenerateMutation();

  // ✅ FETCH FACULTY (MISSING BEFORE)
  const { data: facultyList = [], isLoading: isFacultyLoading } =
    useGetFacultyQuery();

  const [formData, setFormData] =
    useState<ApplicationFormData>(initialFormState);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    const numericFields = [
      'adviser',
      'panel_chair',
      'panel1',
      'panel2',
      'panel3',
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formattedData = {
        ...formData,
        datetime_defense: new Date(formData.datetime_defense).toLocaleString(
          'en-US',
          {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }
        ),
      };

      const docUrl = await proposalGenerate(formattedData).unwrap();
      setPreviewUrl(docUrl);

      toast.success('Document generated successfully!');
    } catch (error) {
      console.error('Document generation failed:', error);
      toast.error('Failed to generate document.');
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
    facultyList,        // ✅ NOW EXISTS
    isFacultyLoading,
    handleChange,
    handleSubmit,
    handleDownload,
    setPreviewUrl,
  };
}
