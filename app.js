const bodyParser = require("body-parser");
const expressSanitizer = require("express-sanitizer");
methodOverride   = require("method-override");
mongoose         = require("mongoose");
expressSanitize  = require("express-sanitizer");
express          = require("express");
app              = express();

mongoose.connect("mongodb://localhost:27017/restful_blog_app",
{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("Connected to DB!"))
.catch(error => console.log(error.message));

// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE MODEL CONFIG
let blogSchema = new mongoose.Schema(
{
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
let Blog = mongoose.model("Blog", blogSchema);

// RESTFUL ROUTES
// INDEX ROUTE
app.get("/", (req,res) =>
{
    res.redirect("/blogs");
});
app.get("/blogs", (req, res) =>
{   
    Blog.find({}, (error, allBlogs) =>
    {
        if(error)
            console.log(error);
        else
            res.render("index", {blogs: allBlogs});
    });
});

// NEW ROUTE
app.get("/blogs/new", (req, res) =>
{
    res.render("new");
});

// CREATE ROUTE
app.post("/blogs", (req, res) =>
{   
    // create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (error, newBlog) =>
    {
        if(error)
            res.render("new");
        else
        {
            res.redirect("/blogs");
        }
    }
    );
});

// SHOW ROUTE
app.get("/blogs/:id", (req, res) =>
{   
    // find blog by provided id
    Blog.findById(req.params.id, (error, foundBlog) =>
    {
        if(error)
            res.redirect("/blogs");
        else
            // render show template with that blog
            res.render("show", {blog: foundBlog});
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", (req, res) =>
{   
    Blog.findById(req.params.id, (error, foundBlog) =>
    {
        if(error)
            res.redirect("/blogs");
        else
        {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", (req, res) =>
{   
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (error, updatedBlog) =>
    {
        if(error)
            res.redirect("/blogs");
        else
        {
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

// DESTROY ROUTE
app.delete("/blogs/:id", (req, res) =>
{
    // destroy blog
    Blog.findByIdAndRemove(req.params.id, (error) =>
    {
        if(error)
            res.redirect("/blogs");
        else
        {
            res.redirect("/blogs");
        }
    });
});

app.listen(3000, () =>
{
   console.log("Started at port 3000!"); 
});