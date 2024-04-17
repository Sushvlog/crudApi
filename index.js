import express from 'express';
import mongoose from 'mongoose';

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/family')
    .then(() => console.log("Database connected"))
    .catch(err => console.log(err));

// Define parent Schema
const parentSchema = new mongoose.Schema({
    name: String,
    childs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Child" }]
});

const ParentModel = mongoose.model("Parent", parentSchema);

// Define child Schema
const childSchema = new mongoose.Schema({
    title: String,
    parent: [{ type: mongoose.Schema.Types.ObjectId, ref: "Parent" }]
});

const ChildModel = mongoose.model("Child", childSchema);

// Get all parent
app.get("/parents", async (req, res) => {
    try {
        const parents = await ParentModel.find().populate("childs");
        res.json(parents)
    } catch (error) {
        res.status(500).json({ message: "Error fetching parents", error: error.message })
    }
});

// Get all child
app.get("/childs", async (req, res) => {
    try {
        const childs = await ChildModel.find().populate("parent");
        res.json(childs)
    } catch (error) {
        res.status(500).json({ message: "Error fetching childs", error: error.message })
    }
});
app.post('/parents', async (req, res) => {
    try {
        const { name } = req.body;
        const parent = new ParentModel({ name });
        await parent.save();
        res.json(parent);
    } catch (error) {
        res.status(500).json({ message: "Error creating parent", error: error.message });
    }
});

// Create Child
app.post('/childs', async (req, res) => {
    try {
        const { title, parentId } = req.body;
        const parent = await ParentModel.findById(parentId);
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }
        const child = new ChildModel({ title, parent: parent._id });
        await child.save();
        parent.childs.push(child);
        await parent.save();
        res.json(child);
    } catch (error) {
        res.status(500).json({ message: "Error creating child", error: error.message });
    }
});


// Update Parent
app.put('/parents/:id', async (req, res) => {
    try {
        const { name } = req.body;
        const parent = await ParentModel.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true }
        );
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }
        res.json(parent);

        res.json({message : "Parent data sucessfully added"});

    } catch (error) {
        res.status(500).json({ message: "Error updating parent", error: error.message });
    }
});

// Delete Parent
app.delete('/parents/:id', async (req, res) => {
    try {
        const parent = await ParentModel.findByIdAndDelete(req.params.id);
        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }
        res.json({ message: "Parent deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting parent", error: error.message });
    }
});

// Server Listen
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
