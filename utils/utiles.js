// eslint-disable-next-line max-classes-per-file
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
  }
}

class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.quryString = queryString;
  }

  // filteraing
  filter() {
    const quryObj = { ...this.quryString };
    const excludesFildes = ["page", "limit", "sort", "keyword", "fildes"];
    const qurySrting = excludesFildes.forEach((fild) => delete quryObj[fild]);
    this.mongooseQuery = this.mongooseQuery.find(qurySrting);

    return this;
  }

  // pagination ->
  pagenate(countDocuments) {
    const page = this.quryString.page * 1 || 1;
    const limit = this.quryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    const pages = Math.ceil(countDocuments / limit);
    const pagenation = { currenPage: page, limit, pages };
    // next page
    const endIndex = page * limit;
    if (endIndex < countDocuments) {
      pagenation.next = page + 1;
    }
    // prev page
    if (skip > 0) {
      pagenation.prev = page - 1;
    }
    this.pagenation = pagenation;
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
    return this;
  }

  // sorting
  sort() {
    if (this.quryString.sort) {
      const sorting = this.quryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sorting);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort("createAt");
    }
    return this;
  }

  limitFildes() {
    if (this.quryString.fildes) {
      const fild = this.quryString.fildes.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(fild);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }
    return this;
  }

  // serching
  serch() {
    if (this.quryString.q) {
      const qury = {};
      qury.$or = [
        { title: { $regex: this.quryString.q, $options: "i" } },
        { description: { $regex: this.quryString.q, $options: "i" } },
        { name: { $regex: this.quryString.q, $options: "i" } },
        { email: { $regex: this.quryString.q, $options: "i" } },
        { role: { $regex: this.quryString.q, $options: "i" } },
      ];
      this.mongooseQuery = this.mongooseQuery.find(qury);
    }
    return this;
  }
}

module.exports = { ApiError, ApiFeatures };
