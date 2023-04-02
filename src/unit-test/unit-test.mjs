#!/usr/bin/env node

/**
 * This file exists to ensure all of our scripts are properly linked by Yarn
 * so that we can build the below file later, yet still have access to the
 * script. (This means we don't have to link scripts in a separate phase.)
 */
import("./dist/unit-test.js");
