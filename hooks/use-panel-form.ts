import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-toastify';
import { usePanelGenerateMutation } from '@/redux/features/authApiSlice';
import { useGetFacultyQuery } from '@/redux/features/authApiSlice';

interface PanelFormData {
  research_title: string;
  co_researcher1: string;
  co_researcher2: string;
  co_researcher3: string;
  co_researcher4: string;
  co_researcher5: string;
  lead_researcher: string;
  adviser: number;
  panel_chair: number;
  panel1: number;
  panel2: number;
  panel3: number;
  [key: `co_researcher${number}`]: string;
  [key: `panel${number}`]: number;
}

const initialFormState: PanelFormData = {
  research_title: '',
  co_researcher1: '',
  co_researcher2: '',
  co_researcher3: '',
  co_researcher4: '',
  co_researcher5: '',
  lead_researcher: '',
  adviser: 0,
  panel_chair: 0,
  panel1: 0,
  panel2: 0,
  panel3: 0,
};

export default function usePanelGeneration() {
  const [panelGenerate, { isLoading }] = usePanelGenerateMutation();
  const { data: facultyList = [], isLoading: isFacultyLoading } = useGetFacultyQuery();

  const [formData, setFormData] = useState<PanelFormData>(initialFormState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = ['adviser', 'panel_chair', 'panel1', 'panel2', 'panel3'];
    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const responseBlob = await panelGenerate(formData).unwrap(); // response is Blob
      const blobUrl = URL.createObjectURL(responseBlob);
      setPreviewUrl(blobUrl);
      toast.success('Document is ready for download.');
    } catch (error) {
      console.error('Error generating panel document:', error);
      toast.error('Failed to generate panel document');
    }
  };

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = 'panel_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    formData,
    isLoading,
    previewUrl,
    facultyList,
    isFacultyLoading,
    handleChange,
    handleSubmit,
    handleDownload,
    setPreviewUrl,
  };
}
