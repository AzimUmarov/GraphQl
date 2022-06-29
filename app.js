const express = require("express");
const expressGraphQL = require("express-graphql").graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
    GraphQLList
} = require("graphql");

const app = express();


const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'J. R. R. Tolkien' },
    { id: 3, name: 'Brent Weeks' }
]

const books = [
    { id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
    { id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
    { id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
    { id: 5, name: 'The Two Towers', authorId: 2 },
    { id: 6, name: 'The Return of the King', authorId: 2 },
    { id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This presents book written by author",
    fields: () => ({
        id:{ type: new GraphQLNonNull(GraphQLInt) },
        name:{ type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.id);
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This presents a author of a book",
    fields: () => ({
        id:{ type: new GraphQLNonNull(GraphQLInt) },
        name:{ type: new GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => books.filter(book => book.authorId === author.id)
        }
    })
})


 const rootQueryType = new GraphQLObjectType({
     name: "Query",
     description: "Root Query",
     fields: () => ({
         book: {
             type: BookType,
             description: "Single books",
             args: {
                 id: { type: GraphQLInt }
             },
             resolve: (parent, args) => books[args.id - 1]
         },
         books: {
             type: new GraphQLList(BookType),
             description: "List of books",
             resolve: () => books
         },
         authors: {
             type: new GraphQLList(AuthorType),
             description: "List of authors",
             resolve: () => authors
         },
         author: {
             type: new GraphQLList(AuthorType),
             description: "single author",
             args: {
                 id:{ type: GraphQLInt }
             },
             resolve: (parent, args) => authors[args.id - 1]
         }
     })
 })

const RootMutationType = new  GraphQLObjectType({
    name: "Mutation",
    description: "Mutation blah blah",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "add a book",
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: { type: GraphQLNonNull(GraphQLInt)},
            },
            resolve : (p, args) => {
                const book = {id: books.length, name: args.name, authorId: args.authorid };
                books.push(book);
                return book;
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "add a author",
            args: {
                name: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve : (p, args) => {
                const author = {id: authors.length, name: args.name };
                authors.push(author);
                return author;
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: rootQueryType,
    mutation: RootMutationType
});


app.use("/graphql", expressGraphQL({
    schema: schema,
    graphiql: true
}));

app.listen(5001, () => console.log("Server Running"));