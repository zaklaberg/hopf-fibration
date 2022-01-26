# Visualization of the Hopf fibration

# How to run

`npm i; npm run start`
app runs on localhost:8080 by default

# What's happening?

In the lower left the 2-sphere is shown. Each point on the 2-sphere can be mapped to a set of points(a fiber) on the 3-sphere. For each such point, that set is generated and then stereographically projected back to 3-space. This projection is shown on the main screen.

# Usage

- click on the 2-sphere to project its corresponding fiber.
- press 'h' to lock the camera
- press 'g' to swap camera between the 2-sphere and projection space.
- press 'd' to reset the scene.
- press 'a' to create a ring on the 2-sphere at an inclination given by theta. Theta should be between -1.57 and 1.57, approximately.
- press 'b' to create a ring segment on the 2-sphere at an inclination given by theta. The circle segment is generated up to your cutoff angle.
- press 'c' to create a ring on the 2-sphere containing the origin

# Interesting properties

- Click anywhere on the 2-sphere. See how the fiber is projected into a circle. This is because each fiber is a circle on the 3-sphere, and because stereographic projection preserves circles.
- Click anywhere on the 2-sphere, twice. Notice that the circles never touch at any point. This is a property of the Hopf fibration - any two fibers will never touch. This also allows the projections of fibers to entirely fill 3-space.
- Press 'a' to create a ring on the 2-sphere. Theta should be between approximately -1.57 and 1.57. See how its projection is a torus.
- Press 'a' and create two rings. Pick opposite values for theta, and see how the torii are also linked.
- Press 'a' and create two rings, one with theta ~ 0, one with theta ~ +- 1.5. The size of the projected torii increases as the points on the 2-sphere approach a pole.
