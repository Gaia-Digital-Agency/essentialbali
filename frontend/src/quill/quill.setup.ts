// let Quill: any
// if (typeof document !== 'undefined') {
//     // ReactQuill = (await import('react-quill-new')).default
//     Quill = (await import('react-quill-new')).default
// }

// import Container from 'quill/blots/container'
import Block, {BlockEmbed} from 'quill/blots/block'
import Inline from 'quill/blots/inline'
// import TextBlot from "quill/blots/text"

import {SizeClass as Size} from 'quill/formats/size'
import {FontClass as Font} from 'quill/formats/font'
import {AlignClass as Align} from 'quill/formats/align'
import Link from "quill/formats/link"

// export class GridContainerBlot extends Container {
//     static blotName = 'grid-container';
//     static tagName = 'div';
//     static className = 'quill-grid-container';
//     static allowedChildren = [GridColumnBlot];

//     static create(value: any): Node {
//         const node: any = super.create(value);
//         node.classList.add('grid', 'grid-cols-12', 'gap-4', 'border', 'border-front-red');
//         return node;
//     }
// }

class HighlightBlot extends Block {
    static blotName = 'highlight';
    static tagName = 'div';
    static className = 'quill-highlight';

    static create(value: any): HTMLElement {
        const node: any = super.create(value);
        node.classList.add(
            'pl-8', 'py-2', 'border-l-[5px]', 'border-front-red', 'text-front-body-big'
        );
        return node;
    }
}

class DropCapBlot extends Inline {
    static blotName = 'drop-cap';
    static tagName = 'big';
    static className = 'quill-drop-cap';

    static create(value: any): HTMLElement {
        const node: any = super.create(value);
        node.classList.add(
            'float-left', 'text-5xl', 'font-bold', 'mr-2', '!leading-none'
        );
        return node;
    }
}

class AdBlot extends BlockEmbed {
    static blotName = 'advertisement';
    static tagName = 'div';
    static className = 'quill-ad-embed';

    static create(value: any): Node {
        const node: any = super.create(value);
        node.setAttribute('data-ad-placeholder', 'true');
        node.setAttribute('contenteditable', 'false');
        return node;
    }

    static value() {
        return true;
    }
}

class CustomLink extends Link {
    static create(value: any): HTMLElement {
        const node = super.create(value)
        value = this.sanitize(value)
        node.setAttribute('href', value)
        if(value.startsWith('https://2poiuy.gaiada.com') || value.startsWith('http://localhost:5173') || value.startsWith('/')) {
            node.removeAttribute('target')
        }
        return node
    }
}

export class GridBlockBlot extends BlockEmbed {
    static blotName = 'grid-block'
    static tagName = 'div'
    static className = 'quill-grid-block'

    static create(value: any) {
        const node: any = super.create(value)
        node.classList.add('grid', 'grid-cols-12', 'gap-4', 'border', 'border-front-red')

        const col1 = document.createElement('div')
        col1.classList.add('quill-grid-col', 'md:col-span-6', 'col-span-12')
        col1.innerHTML = '<p><br></p>'

        const col2 = document.createElement('div')
        col2.classList.add('quill-grid-col', 'md:col-span-6', 'col-span-12')
        col2.innerHTML = '<p><br></p>'

        node.appendChild(col1)
        node.appendChild(col2)
        return node
    }

    static value() {
        return true
    }

}

export class CustomImage extends Block {
    static blotName: string = 'custom-image';
    static tagName: string = 'figure';
    // static className: string = 'quill-custom-image-block';
    static create(value?: {url: string, caption: string}): HTMLElement {
        const node: any = super.create()
        node.setAttribute('data-custom-image', 'true')
        const image = document.createElement('img')
        if(value?.url) {
            image.src = value.url
        }
        const caption = document.createElement('figcaption')
        // if(value?.caption) {
        //     caption.innerText = value.caption
        // }
        caption.setAttribute('contenteditable', 'true')
        caption.innerText = value?.caption || 'caption here'
        // caption.style.display = value?.caption ? 'block' : 'none'
        node.appendChild(image)
        node.appendChild(caption)
        return node
    }

    static value(_domNode: HTMLElement) {
        return {
            url: _domNode.querySelector('img')?.getAttribute('src') || '',
            caption: _domNode.querySelector('figcaption')?.innerText || ''
        }
    }
}

class FigureBlot extends BlockEmbed {
    static blotName = "figure";
    static tagName = "figure";
    static create(value: {src: string, caption: string}) {
        const node = super.create();
        const img = document.createElement("img");
        img.src = value.src;

        // const caption = document.createElement("figcaption");
        // caption.contentEditable = "true";
        // caption.innerText = value.caption || "";

        node.appendChild(img);
        // node.appendChild(caption);

        return node;
    }

    static value(node: HTMLElement) {
        return {
            src: node.querySelector("img")?.src,
            // caption: node.querySelector("figcaption")?.innerText || ""
        };
    }
}

export const registerAllCustomFormats = (Quill: any) => {
    Quill.register(FigureBlot);
    if (Quill.imports['blots/highlight']) {
        return;
    }
    Quill.register(CustomImage)
    // Quill.register(GridColumnBlot);
    // Quill.register(GridContainerBlot);
    Quill.register(HighlightBlot);
    Quill.register(DropCapBlot);
    Quill.register(AdBlot);
    // Quill.register(GridBlockBlot)
    Quill.register(CustomLink);
    Quill.register(Size, true);
    Quill.register(Font, true);
    Quill.register(Align, true)
};
