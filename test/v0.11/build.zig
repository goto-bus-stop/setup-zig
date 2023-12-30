const Build = @import("std").Build;

pub fn build(b: *Build) void {
    const optimize = b.standardOptimizeOption(.{});
    const test_build = b.addTest(.{
        .root_source_file = .{ .path = "src/main.zig" },
        .optimize = optimize,
    });
    const run_test = b.addRunArtifact(test_build);

    const test_step = b.step("test", "Run the app");
    test_step.dependOn(&run_test.step);
}
