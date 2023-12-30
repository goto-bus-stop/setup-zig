const Builder = @import("std").build.Builder;

pub fn build(b: *Builder) void {
    const mode = b.standardReleaseOptions();
    const test_build = b.addTest("src/main.zig");
    test_build.setBuildMode(mode);

    const test_step = b.step("test", "Run the app");
    test_step.dependOn(&test_build.step);
}
