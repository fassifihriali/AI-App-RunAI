import { Scissors, Sparkles } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
    const [imageFile, setImageFile] = useState(null);
    const [object, setObject] = useState('');
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const { getToken } = useAuth();

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            toast.error("Please upload an image first");
            return;
        }
        if (!object || object.split(' ').length > 1) {
            toast.error("Please enter only one object name");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('object', object);

            const { data } = await axios.post('/api/ai/remove-image-object', formData, {
                headers: { Authorization: `Bearer ${await getToken()}` }
            });

            if (data.success) {
                setContent(data.content);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
            <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
                <div className='flex items-center gap-3'>
                    <Sparkles className='w-6 text-[#4A7AFF]' />
                    <h1 className='text-xl font-semibold'>Object Removal</h1>
                </div>

                <p className='mt-6 text-sm font-medium'>Upload Image</p>
                <input type="file" accept="image/*" className='w-full p-2 mx-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' onChange={(e) => setImageFile(e.target.files[0])} required />

                <p className='mt-6 text-sm font-medium'>Object to Remove</p>
                {/* <input type="text" value={object} onChange={(e) => setObject(e.target.value)} placeholder="e.g. watch" className='w-full p-2 mt-2 border rounded-md' required /> */}
                <textarea onChange={(e) => setObject(e.target.value)} value={object} rows={4} className='w-full p-2 mx-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='e.g. watch or spoon, only single object name' required />
                <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
                    {loading ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span> : <Scissors className='w-5' />}
                    Remove Object
                </button>
            </form>

            <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h'>
                <div className='flex items-center gap-3'>
                    <Scissors className='w-5 h-5 text-[#4A7AFF]' />
                    <h1 className='text-xl font-semibold'>Processed Image</h1>
                </div>
                {
                    !content ? (
                        <div className='flex-1 flex justify-center items-center'>
                            <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                                <Scissors className='w-9 h-9' />
                                <p>Upload an image and click 'Remive Object' to get started</p>
                            </div>
                        </div>
                    ) : (
                        <img src={content} alt="image" className='mt-3 w-full h-full' />
                    )
                }
            </div>
        </div>
    )
}

export default RemoveObject