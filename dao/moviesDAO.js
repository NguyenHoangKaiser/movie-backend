import mongodb from "mongodb";
const ObjectId = mongodb.ObjectId;

let movies;

export default class MoviesDAO {
  static async injectDB(conn) {
    if (movies) {
      return;
    }
    try {
      movies = await conn.db(process.env.MOVIEREVIEWS_NS).collection("movies");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in moviesDAO: ${e}`
      );
    }
  }

  //async method to get all movies
  static async getMovies({
    filters = null,
    page = 0,
    moviesPerPage = 20,
  } = {}) {
    let query;

    if (filters) {
      if ("title" in filters) {
        query = { $text: { $search: filters["title"] } };
      } else if ("rated" in filters) {
        query = { rated: { $eq: filters["rated"] } };
      }
    }

    let cursor;

    try {
      cursor = await movies
        .find(query)
        .limit(moviesPerPage)
        .skip(moviesPerPage * page);
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`);
      return { moviesList: [], totalNumMovies: 0 };
    }

    const displayCursor = cursor
      .limit(moviesPerPage)
      .skip(moviesPerPage * page);

    try {
      const moviesList = await displayCursor.toArray();
      const totalNumMovies = await movies.countDocuments(query);

      return { moviesList, totalNumMovies };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`
      );
      return { moviesList: [], totalNumMovies: 0 };
    }
  }

  //async method to get all movie ratings
  static async getRatings() {
    let ratings = [];
    try {
      ratings = await movies.distinct("rated");
      return ratings;
    } catch (e) {
      console.error(`Unable to get ratings, ${e}`);
      return ratings;
    }
  }

  static async getMovieByID(id) {
    try {
      return await movies
        .aggregate([
          {
            $match: {
              _id: new ObjectId(id),
            },
          },
          /** $lookup:
          {
          from: <collection to join>,
          localField: <field from the input document>,
          foreignField: <field from the documents of the "from" collection>,
          as: <output array field>
          } */
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "movie_id",
              as: "reviews",
            },
          },
        ])
        .next();
    } catch (e) {
      console.error(`Something went wrong in getMovieByID: ${e}`);
      throw e;
    }
  }
}
