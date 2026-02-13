import { useModal } from "../../../hooks/useModal";
import { Modal } from "../modal";
import Media from "../../media/Media";
import { AssetMedia } from "../../../types/media.type";
import Quill from "quill";
import { useState } from "react";
import { ArticleProps } from "../../../types/article.type";
import ArticleSearch from "../../article/ArticleSearch";
import { registerAllCustomFormats } from "../../../quill/quill.setup";
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL as string

registerAllCustomFormats(Quill)

let TempFile: AssetMedia | null = null
let quillRef: any = null

interface QuillContext {
    quill: Quill
}

const CustomToolbar = () => {
    const {closeModal, isOpen, openModal} = useModal()
    const [articleModal, setArticleModal] = useState<boolean>(false)

    const onSave = (file: AssetMedia) => {
        TempFile = file
        closeModal()
        if(quillRef) {
            const range = quillRef.getSelection(true)
            quillRef.insertEmbed(range.index, 'image', `${API_URL}/${TempFile.path}`);
            quillRef.setSelection(range.index + 1, 0);
        }
    }

    const onArticle = (articles: ArticleProps[]) => {
        setArticleModal(false)
        if(quillRef) {
            const range = quillRef.getSelection(true)
            let currentIndex = range.index
            articles.forEach(article => {
                const title = `${article.title}\n`;
                const imageUrl = `${API_URL}/${article.featured_image_url}`;
                quillRef.insertText(currentIndex, title, 'bold', true);
                currentIndex += title.length;
                quillRef.insertEmbed(currentIndex, 'image', imageUrl);
                currentIndex += 1;
                const lengthBeforePaste = quillRef.getLength();
                quillRef.clipboard.dangerouslyPasteHTML(currentIndex, article.article_post);
                const lengthAfterPaste = quillRef.getLength();

                const pastedLength = lengthAfterPaste - lengthBeforePaste;
                currentIndex += pastedLength;
                quillRef.insertText(currentIndex, '\n\n');
                currentIndex += 2;
            });
            quillRef.setSelection(currentIndex, 0, 'user');
        }
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={closeModal}>
                <Media onSave={(file) => {
                    onSave(file);
                    // closeModal()
                }} />
            </Modal>

            <Modal isOpen={articleModal} isFullscreen={false} onClose={() => {setArticleModal(false)}}>
                <ArticleSearch onSave={onArticle} />
            </Modal>
            
            <button className="hidden" onClick={openModal} id="editor-image-modal">
                Add Image
            </button>
            <button className="hidden" onClick={() => {setArticleModal(true)}} id="editor-article-modal">
                Article Embed
            </button>
        </>
    )
}

function dropCapHandler(this: QuillContext) {
    const editor = this.quill
    if (!editor) return;
    const range = editor.getSelection(true);
    if (!range) return;
    const [line, offset] = editor.getLine(range.index);
    const lineStartIndex = range.index - offset;
    const formats = editor.getFormat(lineStartIndex, 1);
    const isAlreadyDropCap = !!formats['drop-cap'];
    if(line) {
        editor.formatText(lineStartIndex, line.length(), 'drop-cap', false);
        if (!isAlreadyDropCap && line.domNode.innerText.trim().length > 0) {
            editor.formatText(lineStartIndex, 1, 'drop-cap', true);
        }
    }
};
function highlightHandler(this: QuillContext) {
    const editor = this.quill;
    if (!editor) return;
    const range = editor.getSelection();
    if (!range) return;
    const formats = editor.getFormat(range.index, range.length);
    editor.formatLine(range.index, range.length, 'highlight', !formats.highlight);
}

function customImageHandler(this: QuillContext) {
    quillRef = this.quill
    document.querySelector<HTMLButtonElement>('#editor-image-modal')?.click()
}

function embedArticleHandler(this: QuillContext) {
    quillRef = this.quill
    document.querySelector<HTMLButtonElement>('#editor-article-modal')?.click()
}

export const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'list',
    'link', 'image', 'font', 'size',
    'highlight', 'drop-cap', 'advertisement', 'align', 'embed-article', 'custom-image', 'figure'
];

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike', 'link'],
    ['blockquote', 'code-block', 'dropcap', 'highlight', 'custom-image' , 'embed-article'],
    [{ 'align': [] }],
    [{ 'size': ['small', false, 'large', 'larger', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': ['sans', 'serif'] }],
]

export const modules = {
    toolbar: {
        container: toolbarOptions,
        
        handlers: {
            'dropcap': dropCapHandler,
            'highlight': highlightHandler,
            'custom-image': customImageHandler,
            'embed-article': embedArticleHandler
        }
    }
}

export default CustomToolbar