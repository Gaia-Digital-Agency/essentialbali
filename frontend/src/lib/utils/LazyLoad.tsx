// import * as LazyLoadImageModule from 'react-lazy-load-image-component'
// const {LazyLoadImage} = LazyLoadImageModule
// console.log(LazyLoadImage, 'from lib')
// export default LazyLoadImage

const { LazyLoadImage } = await import('react-lazy-load-image-component')
console.log(LazyLoadImage, 'lazy from lib')
export default LazyLoadImage