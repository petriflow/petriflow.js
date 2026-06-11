# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [2.2.1](https://github.com/petriflow/petriflow.js/releases/tag/v2.2.1) (2025-05-07)

### Fixed
- [PF-79] Variables with no init values referenced in arcs will cause arcs not to load

### Added
- [PF-80] Global roles support


## [2.2.0](https://github.com/petriflow/petriflow.js/releases/tag/v2.2.0) (2024-07-26)

### Changed
- [PF-71] Sort collections before export
- [PF-72] Tags


## [2.1.0](https://github.com/petriflow/petriflow.js/releases/tag/v2.1.0) (2024-07-02)

### Changed
- [PF-58] Action indentation


## [2.0.0](https://github.com/petriflow/petriflow.js/releases/tag/v2.0.0) (2023-11-05)

### Added
- [PF-34] Simulation

### Changed
- [PF-52] Do not export empty events
- [PF-54] DataRef order by position

### Fixed
- [PF-55] Missing data ref attribute - immediate

## [1.3.5](https://github.com/petriflow/petriflow.js/releases/tag/v1.3.5) (2023-04-13)

### Fixed
- [PF-49] Update date field init type 

## [1.3.4](https://github.com/petriflow/petriflow.js/releases/tag/v1.3.4) (2022-05-04)

### Changed
- [PF-42] Update Petriflow schema location URL

## [1.3.3](https://github.com/petriflow/petriflow.js/releases/tag/v1.3.3) (2022-03-01)

### Changed
- [PF-25] Action code new lines
- [PF-26] Readme update
- [PF-32] Predefined role ref

### Fixed
- [PF-24] Add support for compactDirection and hideEmptyRows tags
- [PF-31] Invalid XML characters


## [1.3.2](https://github.com/petriflow/petriflow.js/releases/tag/v1.3.2) (2022-01-26)

### Fixes
- [PF-20] Tag order in exported XML
- [PF-22] CDATA export
- [PF-23] Not all classes implements clone() properly


## [1.3.1](https://github.com/petriflow/petriflow.js/releases/tag/v1.3.1) (2021-12-17)

### Fixes
- [PF-17] Layout imports rows cols with default value 0
- [PF-18] Validation does not clone properties
- [PF-19] Export tag should escape XML invalid characters

## [1.3.0](https://github.com/petriflow/petriflow.js/releases/tag/v1.3.0) (2021-12-07)

### Changed
- [PF-11] Update TS library
- [PF-13] Clean up petriflow schema
- [PF-16] Anonymous role

### Fixes
- [PF-14] Data validation getter/setter

## [1.2.0](https://github.com/petriflow/petriflow.js/releases/tag/v1.2.0) (2021-11-03)

### Fixed 
 - [PF-6] Import ignores values i18n name
 - [PF-7] Transition layout legacy imports with rows and cols 0
 - [PF-8] RoleRef logic import
 - [PF-9] Place i18n name ignored
 
## [1.1.0](https://github.com/petriflow/petriflow.js/releases/tag/v1.1.0) (2021-10-19)

### Fixed
 - [PF-3] Events are not cloned properly
 - [PF-2] Grammar and spelling in non-code files

## [1.0.0](https://github.com/petriflow/petriflow.js/releases/tag/v1.0.0) (2021-10-13)

First public release of the project.

Full Changelog: [https://github.com/petriflow/petriflow.js/commits/v1.3.2](https://github.com/petriflow/petriflow.js/commits/v1.3.2)


<!-- Template
## [version](https://github.com/petriflow/petriflow.js/releases/tag/v) (YYYY-MM-dd)

### Added
 - for new features.

### Changed
 - for changes in existing functionality.

### Deprecated
 - for soon-to-be removed features.

### Removed
 - for now removed features.

### Fixed
 - for any bug fixes.

### Security
 - in case of vulnerabilities.
-->
