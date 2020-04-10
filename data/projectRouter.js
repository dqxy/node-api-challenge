const express = require('express');

const ProjectDb = require('./helpers/projectModel.js');
const ActionDb = require('./helpers/actionModel.js');

const router = express.Router();

router.post('/', validateProject, (req, res) => {
  ProjectDb.insert(req.body)
  .then(project => {
    res.status(201).json(project);
  })
  .catch(err => {res.status(500).json({ message: "Error saving new project" });
  });
});

router.post('/:id/action', validateProjId, validateAction, (req, res) => {
  ActionDb.insert({
    description: req.body.description,
    notes: req.body.notes,
    project_id: req.params.id
  })
  .then(post => {
    res.status(201).json(post);
  })
  .catch(err => {  res.status(500).json({ message: "Error saving new action", err });
  })
});

router.get('/', (req, res) => {
  ProjectDb.get()
  .then(users => {
    res.status(200).json(users);
  })
  .catch(err => {
    res.status(500).json({ message: "Error retrieving projects." });
  })
});

router.get('/:id', validateProjId, (req, res) => {
  res.status(200).json(req.user);
});

router.get('/:id/action', validateProjId, (req, res) => {
  ProjectDb.getProjectActions(req.params.id)
  .then(actions => {
    if(actions){
      res.status(200).json(actions);
    } else {
      res.status(404).json({ message: `No actions found for ${req.project.name}.`});
    }
  })
  .catch(err => {
    res.status(500).json({ message: "Error retrieving actions." });
  })
});

router.delete("/:id", validateProjId, (req, res) => {
  ProjectDb.remove(req.params.id)
    .then(() => {
      res.status(200).json({ message: "project deleted" });
    })
    .catch(() => {
      res.status(500).json({ message: "unable to delete the project" });
    });
});

router.delete("/action/:id", (req, res) => {
  ActionDb.remove(req.params.id)
    .then(() => {
      res.status(200).json({ message: "action deleted" });
    })
    .catch(() => {
      res.status(500).json({ message: "unable to delete the action" });
    });
});

router.put("/:id", (req, res) => {
  ProjectDb.update(req.params.id, req.body)
    .then(() => {
      res.status(200).json(req.body);
    })
    .catch(() => {
      res.status(500).json({ message: "unable to update project info" });
    });
});

router.put("/action/:id", (req, res) => {
  ActionDb.update(req.params.id, req.body)
    .then(() => {
      res.status(200).json(req.body);
    })
    .catch(() => {
      res.status(500).json({ message: "unable to update action" });
    });
});

//MIDDLEWARE

function validateProjId(req, res, next) {
  if (req.params.id){
    ProjectDb.get(req.params.id)
  .then(thisProj => {
    if (thisProj) {
      req.project = thisProj;
      next();
    } else {
      res.status(404).json({ message: "invalid project id" });
    }
  })
  .catch(err => {
    res.status(500).json({ message: "Error checking for project." });
  })
  } else {
    res.status(400).json({ message: "Project id required."});
  }
  
}

function validateProject(req, res, next) {
  if (req.body) {
    if (req.body.name && req.body.description) {
      next();
    } else {
      res.status(400).json({ message: "name and description required" })
    }
  } else {
    res.status(400).json({ message: "missing project data" });
  }
}

function validateAction(req, res, next) {
  if (req.body) {
    if (req.body.description && req.body.notes) {
      if(req.body.description.length < 129){next();} else {res.status(400).json({ message: "description too long!" });}
    } else {
      res.status(400).json({ message: "description and notes required" });
    }
  } else {
    res.status(400).json({ message: "missing action data" });
  }
}

module.exports = router;