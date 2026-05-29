const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = path.resolve(__dirname, '../..');
const AGENT_DIR = path.join(WORKSPACE_ROOT, '.agent');
const BACKUP_DIR = path.join(WORKSPACE_ROOT, '.backup');

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '      ANTIGRAVITY WORKSPACE DOCTOR AUDIT         ');
console.log('\x1b[36m%s\x1b[0m', '==================================================\n');

let issuesCount = 0;
let warningsCount = 0;

function logSuccess(message) {
    console.log('\x1b[32m%s\x1b[0m', `  ✔ ${message}`);
}

function logWarning(message) {
    console.log('\x1b[33m%s\x1b[0m', `  ⚠ [WARNING] ${message}`);
    warningsCount++;
}

function logError(message) {
    console.log('\x1b[31m%s\x1b[0m', `  ✘ [ERROR]   ${message}`);
    issuesCount++;
}

// 1. Directory Structure Audit
console.log('\x1b[35m%s\x1b[0m', '--- 1. Directory Structure Audit ---');
const directories = [
    { name: 'Root .agent', path: AGENT_DIR },
    { name: 'Skills scope', path: path.join(AGENT_DIR, 'skills') },
    { name: 'Instructions scope', path: path.join(AGENT_DIR, 'instructions') },
    { name: 'Scripts scope', path: path.join(AGENT_DIR, 'scripts') },
    { name: 'Backup folder', path: BACKUP_DIR }
];

directories.forEach(dir => {
    if (fs.existsSync(dir.path)) {
        const stats = fs.statSync(dir.path);
        if (stats.isDirectory()) {
            logSuccess(`${dir.name} directory is present and correct.`);
        } else {
            logError(`${dir.name} exists but is not a directory!`);
        }
    } else {
        logError(`${dir.name} directory is missing at: ${dir.path}`);
    }
});

// 2. Configuration Files Audit
console.log('\n\x1b[35m%s\x1b[0m', '--- 2. Configuration Files Audit ---');
const manifestPath = path.join(AGENT_DIR, 'manifest.json');
const toolsPath = path.join(AGENT_DIR, 'tools.json');

// Validate manifest.json
if (fs.existsSync(manifestPath)) {
    try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        if (manifest.protocol_version && manifest.workspace_name) {
            logSuccess(`manifest.json is valid (protocol: ${manifest.protocol_version}, workspace: "${manifest.workspace_name}").`);
        } else {
            logWarning('manifest.json is missing required protocol_version or workspace_name fields.');
        }
    } catch (err) {
        logError(`manifest.json failed to parse: ${err.message}`);
    }
} else {
    logError('manifest.json is missing!');
}

// Validate tools.json
let parsedTools = null;
if (fs.existsSync(toolsPath)) {
    try {
        const toolsContent = fs.readFileSync(toolsPath, 'utf8');
        parsedTools = JSON.parse(toolsContent);
        logSuccess('tools.json is syntactically valid JSON.');
    } catch (err) {
        logError(`tools.json failed to parse: ${err.message}`);
    }
} else {
    logError('tools.json is missing!');
}

// 3. Declarative Governance Matrix Audit
console.log('\n\x1b[35m%s\x1b[0m', '--- 3. Declarative Governance Matrix Audit ---');
if (parsedTools) {
    const requiredKeys = ['version', 'global_policy', 'agents'];
    const missingKeys = requiredKeys.filter(k => !parsedTools[k]);
    
    if (missingKeys.length === 0) {
        logSuccess('Governance matrix includes version, global_policy, and agents scopes.');
        
        // Check global policy
        const policy = parsedTools.global_policy;
        if (policy.safe && policy.sensitive && policy.restricted) {
            logSuccess('Tool classifications (safe, sensitive, restricted) are fully defined.');
        } else {
            logError('Tool classifications in global_policy are incomplete!');
        }

        // Check custom agents mapping
        const expectedAgents = ['arcora_auditor', 'arcora_fixer', 'arcora_reviewer', 'firebase_guardian', 'launch_ops'];
        expectedAgents.forEach(agentName => {
            const agent = parsedTools.agents[agentName];
            if (agent) {
                if (Array.isArray(agent.allowed_tiers)) {
                    logSuccess(`Agent profile "${agentName}" is correctly configured (tiers: ${agent.allowed_tiers.join(', ')}).`);
                } else {
                    logError(`Agent profile "${agentName}" is missing allowed_tiers array!`);
                }
            } else {
                logError(`Expected agent profile "${agentName}" is missing from tools.json!`);
            }
        });
    } else {
        logError(`tools.json governance config is missing required root sections: ${missingKeys.join(', ')}`);
    }
} else {
    logError('Skipped governance matrix audit due to tools.json load failure.');
}

// 4. Custom Skills Integrity Audit
console.log('\n\x1b[35m%s\x1b[0m', '--- 4. Custom Skills Integrity Audit ---');
const skillsDir = path.join(AGENT_DIR, 'skills');
if (fs.existsSync(skillsDir) && fs.statSync(skillsDir).isDirectory()) {
    const skillFolders = fs.readdirSync(skillsDir);
    console.log(`  Found ${skillFolders.length} skills in .agent/skills/ directory.`);
    
    let compliantSkillsCount = 0;
    skillFolders.forEach(folderName => {
        const skillPath = path.join(skillsDir, folderName);
        if (fs.statSync(skillPath).isDirectory()) {
            const skillMdPath = path.join(skillPath, 'SKILL.md');
            if (fs.existsSync(skillMdPath)) {
                try {
                    const content = fs.readFileSync(skillMdPath, 'utf8');
                    // Simple frontmatter check
                    if (content.trim().startsWith('---') && content.includes('name:') && content.includes('description:')) {
                        compliantSkillsCount++;
                    } else {
                        logWarning(`Skill "${folderName}" has SKILL.md, but frontmatter format is legacy or missing.`);
                    }
                } catch (err) {
                    logWarning(`Skill "${folderName}" SKILL.md could not be read: ${err.message}`);
                }
            } else {
                logError(`Skill directory "${folderName}" is missing a SKILL.md manifest!`);
            }
        }
    });
    
    if (compliantSkillsCount === skillFolders.length) {
        logSuccess(`All ${skillFolders.length} custom skills are fully compliant with standard Antigravity frontmatter.`);
    } else {
        console.log(`  Summary: ${compliantSkillsCount}/${skillFolders.length} skills are compliant.`);
    }
} else {
    logError('Skills directory missing, cannot check skills integrity.');
}

// 5. System-wide Relocated Assets check
console.log('\n\x1b[35m%s\x1b[0m', '--- 5. Relocated Assets Audit ---');
const globalRulesPath = path.join(AGENT_DIR, 'instructions', 'global_rules.md');
const smokeTestPath = path.join(AGENT_DIR, 'scripts', 'smoke_test_ai.cjs');

if (fs.existsSync(globalRulesPath)) {
    logSuccess('Global development rules successfully migrated to instructions/global_rules.md.');
} else {
    logError('Global rules instructions/global_rules.md are missing!');
}

if (fs.existsSync(smokeTestPath)) {
    logSuccess('Smoke test automation script successfully relocated to scripts/smoke_test_ai.cjs.');
} else {
    logError('Smoke test script scripts/smoke_test_ai.cjs is missing!');
}

// Summary Report
console.log('\n\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '                 AUDIT SUMMARY                    ');
console.log('\x1b[36m%s\x1b[0m', '==================================================');
if (issuesCount === 0) {
    console.log('\x1b[32m%s\x1b[0m', `\n  ✔ SUCCESS: 0 critical issues found! Local intelligence layer is healthy.`);
    if (warningsCount > 0) {
        console.log('\x1b[33m%s\x1b[0m', `  ⚠ NOTE: There are ${warningsCount} warnings to review.`);
    }
} else {
    console.log('\x1b[31m%s\x1b[0m', `\n  ✘ FAILED: ${issuesCount} critical issues and ${warningsCount} warnings found! Please correct before proceeding.`);
}
console.log('\x1b[36m%s\x1b[0m', '==================================================\n');

process.exit(issuesCount === 0 ? 0 : 1);
