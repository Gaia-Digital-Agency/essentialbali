import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import ReactQuill, { DeltaStatic, EmitterSource } from 'react-quill-new';
import { createRoot } from 'react-dom/client';
import Advertisement from './Advertisement';
import { useNotification } from '../../../context/NotificationContext';
import CustomToolbar, {formats, modules} from './Toolbar';
import Delta from 'quill-delta';



// We'll use this to keep track of the React roots we create
const adRoots = new Map();

// Helper function to render React components into the ad blots
const renderAdComponents = (editor: Quill) => {
    const adNodes = editor.container.querySelectorAll('.quill-ad-embed');
    
    adNodes.forEach((node) => {
        const nodeKey = node.getAttribute('data-key') || Math.random().toString(36).substring(2);
        node.setAttribute('data-key', nodeKey);

        if (adRoots.has(nodeKey)) return; // Already rendered

        const root = createRoot(node);
        root.render(<Advertisement />);
        adRoots.set(nodeKey, root);
    });
};


type QuillElementProps = {value?: string | undefined, onChange: (html: string, delta: DeltaStatic, source: EmitterSource) => void}

const QuillWysiwyg: React.FC<QuillElementProps> = ({ value, onChange }) => {
    const quillRef = useRef<ReactQuill>(null);
    const imageTooltipRef = useRef<HTMLDivElement>(null)
    const {setNotification} = useNotification()

    useEffect(() => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        // setTimeout(() => renderAdComponents(editor), 0);

        const shortcodeHandler = (delta: Delta, oldDelta: Delta, source: EmitterSource) => {
            if (source !== 'user') return;
            const text = editor.getText();
            const shortcode = '[ads]';
            const matchIndex = text.indexOf(shortcode);

            if (matchIndex !== -1) {
                editor.deleteText(matchIndex, shortcode.length, 'silent');
                editor.insertEmbed(matchIndex, 'advertisement', true, 'silent');
                editor.insertText(matchIndex + 1, ' ', 'silent');
                setTimeout(() => renderAdComponents(editor), 0);
            }
            if(delta && oldDelta) {
                
            }
        };

        editor.on('text-change', shortcodeHandler);
        return () => {
            editor.off('text-change', shortcodeHandler);
        };
    }, []);

    useEffect(() => {
        const editor = quillRef.current?.getEditor()
        if(!editor) return
        
        const imageHandler = (delta: Delta, _oldDelta: Delta, source: EmitterSource) => {
            delta.ops?.forEach(op => {
                if (op.insert && (op.insert as Record<string, string>).image && source == 'api') {
                    const url = (op.insert as Record<string, string>).image;
                    const range = editor.getSelection(true);
                    // editor.insertText(range.index + 1, 'add caption here', {size: 'small', italic: true}, 'user')
                    editor.deleteText(range.index, 1); 

                    editor.insertEmbed(range.index, 'figure', {src: url}, 'user');
                }
            });
            
        }

        editor.on('text-change', imageHandler)

        return () => {
            editor.off('text-change', imageHandler)
        }
    }, [])


    useEffect(() => {
        const editor = quillRef.current?.getEditor()
        if (!editor) return

        editor.clipboard.addMatcher("IMG", () => {
            return new Delta()
        })

        const handleDataTransfer = (e: ClipboardEvent | DragEvent) => {
            const data = (e as ClipboardEvent).clipboardData ?? (e as DragEvent).dataTransfer

            if (!data?.files?.length) {
                return
            }

            const hasImage = Array.from(data.files).some(file =>
                file.type.startsWith("image/")
            )

            if (hasImage) {
                setNotification({message: 'Please upload image to media library to put into article', type: 'fail'})
                e.preventDefault()
                e.stopPropagation()
            }
        }

        editor.root.addEventListener("paste", handleDataTransfer, {capture: true})
        editor.root.addEventListener("drop", handleDataTransfer, {capture: true})

        // Return a cleanup function to remove the event listeners on unmount
        return () => {
            editor.root.removeEventListener("paste", handleDataTransfer, {capture: true})
            editor.root.removeEventListener("drop", handleDataTransfer, {capture: true})
        }
    }, [])

    useEffect(() => {
        const editor = quillRef.current?.getEditor()
        const tooltip = imageTooltipRef.current
        if(!editor || !tooltip) return
        const checkImageTooltip = (e: MouseEvent) => {
            const img = (e.target as HTMLElement).closest('div[data-custom-image="true"]') as HTMLImageElement
            editor.root.querySelectorAll('div[data-custom-image="true"]').forEach((el) => {
                (el as HTMLImageElement).removeAttribute('data-active');
                (el as HTMLImageElement).style.outline = '';
            })
            if(!img) {
                tooltip.style.display = 'none'
                return
            }

            img.setAttribute('data-active', 'true')
            img.style.outline = '2px solid #4a90e2'

            const rect = img.getBoundingClientRect()
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.top + window.scrollY - 40}px`;
            tooltip.style.display = 'block';
        }

        editor?.root.addEventListener('click', checkImageTooltip)

        return () => {
            editor.root.removeEventListener('click', checkImageTooltip)
        }
    }, [])

    // const addCaptionHandler = (e: FormEvent) => {
    //     e.preventDefault()
    //     const editor = quillRef.current?.getEditor()
    //     if(!editor) return;
    //     const select = editor.getSelection(true)
    //     const QuillRef = quillRef.current
    //     if(QuillRef) {
    //         const imgActive = document.querySelector('[data-custom-image="true"][data-active="true"]')
    //         if(imgActive) {
    //             Quill.find(imgActive).format('caption', caption)
    //         }
    //     }
    //     // editor.formatText(select, 'caption', caption, 'user')
    //     setCaption('')
    // }

    const changeHandler = (html: string, delta: DeltaStatic, source: EmitterSource) => {
        const editor = quillRef.current?.getEditor()
        if(!editor) return
        onChange(html, delta, source)
    }
    // const addCaptionButtonHandler = () => {
    //     const editor = quillRef.current?.getEditor()
    //     if(!editor) return;
    //     const imgActive = document.querySelector('[data-custom-image="true"][data-active="true"]')
    //     if(imgActive) {
    //         Quill.find(imgActive).format('caption', 'add caption here')
    //     }

    // }
    return (
        <>
            <CustomToolbar />
            <ReactQuill
                id="react-quill"
                ref={(el) => {quillRef.current = el}}
                theme="snow"
                defaultValue={value}
                onChange={changeHandler}
                modules={modules}
                formats={formats}
                style={{height: "800px", overflowY: "scroll"}}
            />
            <div ref={imageTooltipRef} id="image-tooltip" 
                style={{
                    'position': 'absolute',
                    'display': 'none',
                    // 'visibility': 'hidden',
                    // 'pointerEvents': 'none',
                    'padding': '6px 12px',
                    'background': '#000',
                    'color': '#fff',
                    'borderRadius': '4px',
                    'zIndex': '99999',
                    'fontSize': '12px',
                }}>
                    <button onClick={() => {}}>+Add Caption</button>
            </div>

        </>
    );
};

export default QuillWysiwyg;