# Rosie the release bot

Rosie helps keep everyone on our team in the loop on when things get released to which environments.

If you track your development tasks in GitHub issues, [close issues via commit messages](https://help.github.com/articles/closing-issues-via-commit-messages), and use slack -- then rosie is the bot for you!

### What does she do?

Say `rosie issues since [commit hash or git tag]` in a slack channel and rosie will respond with the titles of the issues that are referenced in commits after that commit hash or git tag.

![Example slack message](http://i.imgur.com/AnE6z2K.png)

### What's next?

We want to expand rosie to help automate other parts of the development workflow. Please feel free to make suggestions in the github issues of this project.
