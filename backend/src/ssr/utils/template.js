// export const HomeTemplate = {
//     heroImage: {
//         articles: [0,0,0],
//         rules: {
//             limit: 3
//         },
//         query: {
//             useRoute: true
//         }
//     },
//     trending: {
//         articles: [0,0,0,0,0],
//         rules: {
//             limit: 5
//         },
//         query: {
//             useRoute: true
//         }
//     },
//     mostPopular: {
//         articles: [0,0,0,0,0,0,0,0],
//         rules: {
//             limit: 8
//         },
//         query: {
//             useRoute: true,
//             category: {
//                 slug: 'most-popular'
//             }
//         }
//     },
//     events: {
//         articles: [0,0,0,0],
//         rules: {
//             limit: 4
//         },
//         query: {
//             useRoute: true,
//             category: {
//                 slug: 'events'
//             }
//         }
//     },
//     ultimateGuide: {
//         articles: [0,0,0,0,0,0],
//         rules: {
//             limit: 6
//         },
//         query: {
//             useRoute: true,
//             category: {
//                 slug: 'ultimate-guide'
//             }
//         }
//     },
//     overseas: {
//         articles: [0,0,0,0,0,0,0,0],
//         rules: {
//             limit: 8
//         },
//         query: {
//             useRoute: false
//         }
//     }
// }

export const HomeTemplate = {
    heroImage: {
        articles: [0,0,0],
        rules: {
            limit: 3
        },
        query: {
            useRoute: true,
            pinned: 1,
            category: {
                slug: 'featured'
            }
        }
    },
    trending: {
        articles: [0,0,0,0,0],
        rules: {
            limit: 5
        },
        query: {
            useRoute: true,
            category: {
                exclude_slugs: ['most-popular', 'ultimate-guide', 'events']
            }
        }
    },
    mostPopular: {
        articles: [0,0,0,0,0,0,0,0],
        rules: {
            limit: 8
        },
        query: {
            useRoute: true,
            category: {
                slug: 'most-popular'
            }
        }
    },
    events: {
        articles: [0,0,0,0],
        rules: {
            limit: 4
        },
        query: {
            useRoute: true,
            category: {
                slug: 'events'
            }
        }
    },
    ultimateGuide: {
        articles: [0,0,0,0,0,0],
        rules: {
            limit: 6
        },
        query: {
            useRoute: true,
            category: {
                slug: 'ultimate-guide'
            }
        }
    },
    overseas: {
        articles: [0,0,0,0,0,0,0,0],
        rules: {
            limit: 8
        },
        query: {
            useRoute: false
        }
    }
}