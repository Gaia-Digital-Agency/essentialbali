// import Quill from 'quill';


// const Container = Quill.import('blots/container');
// const Block = Quill.import('blots/block/embed');
// const Text = Quill.import('blots/inline')

// const Size = Quill.import('attributors/class/size');
// const Font = Quill.import('attributors/class/font');

// const sizeList = ['small', 'large', 'huge']; // 'normal' is the default
// const fontList = ['sans', 'serif'];

// Size.whitelist = sizeList;
// Font.whitelist = fontList;


// class GridColumnBlot extends Block {
//     static blotName = 'grid-column';
//     static tagName = 'div';
//     static className = 'quill-grid-col';
//     static create(value: any): Node {
//         const node = super.create(value);
//         node.classList.add('md:col-span-6', 'col-span-12');
//         // node.classList.add('w-1/2', 'float-left')
//         return node;
//     }
// }

// class GridContainerBlot extends Container {
//     static blotName = 'grid-container';
//     static tagName = 'div';
//     static className = 'quill-grid-container';
//     static create(value: any): Node {
//         const node = super.create(value);
//         node.classList.add('grid', 'grid-cols-12');
//         return node;
//     }

//     static allowedChildren = [GridColumnBlot];
// }

// class HighlightBlot extends Block {
//     static blotName = 'highlight'
//     static tagName = 'div';
//     static className = 'quill-highlight'
//     static create(value: any): Node {
//         const node = super.create(value)
//         node.classList.add(
//             'pl-8',
//             'border-l-[10px]',
//             'border-front-red'
//         )
//         return node
//     }
// }

// class DropCapBlot extends Text {
//     static blotName = 'drop-cap';
//     static tagName = 'span';
//     static className = 'quill-drop-cap';

//     static create(value: any): Node {
//         const node = super.create(value);
//         // Apply styling for the drop cap effect.
//         // These utility classes are based on Tailwind CSS.
//         // Ensure your project's CSS includes definitions for these or similar styles.
//         node.classList.add(
//             'float-left',
//             'text-5xl', // Large font size
//             'mr-2',     // Margin to the right
//             'leading-none' // Adjust line height to align with text
//         );
//         return node;
//     }
// }

// export const whitelistGridFormats = () => {
//     // This allows Quill to recognize our custom formats
//     Quill.imports['formats/grid-column'] = true;
//     Quill.imports['formats/grid-container'] = true;
//     Quill.imports['formats/drop-cap'] = true;
//     Quill.imports['formats/highlight'] = true;
// };

// export const registerGridBlots = () => {
//     if(!Quill.imports['blots/grid-column']) {
//         Quill.register(GridColumnBlot);
//     }
//     if(!Quill.imports['blots/grid-container']) {
//         Quill.register(GridContainerBlot);
//     }
//     if(!Quill.imports['blots/highlight']) {
//         Quill.register(HighlightBlot);
//     }
//     if(!Quill.imports['blots/drop-cap']) {
//         Quill.register(DropCapBlot);
//     }

//     Quill.register(Size, true);
//     Quill.register(Font, true);
//     return
// };