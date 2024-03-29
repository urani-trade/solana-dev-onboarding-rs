; ModuleID = 'probe4.c2452a189817723e-cgu.0'
source_filename = "probe4.c2452a189817723e-cgu.0"
target datalayout = "e-m:e-p:64:64-i64:64-n32:64-S128"
target triple = "sbf"

@alloc_1ad0996576525ba5dafa8da043cc6c25 = private unnamed_addr constant <{ [74 x i8] }> <{ [74 x i8] c"/Users/dmitri/work/git/platform-tools/out/rust/library/core/src/num/mod.rs" }>, align 1
@alloc_139151c42ef791b2d5e73ecdd341db03 = private unnamed_addr constant <{ ptr, [16 x i8] }> <{ ptr @alloc_1ad0996576525ba5dafa8da043cc6c25, [16 x i8] c"J\00\00\00\00\00\00\00y\04\00\00\05\00\00\00" }>, align 8
@str.0 = internal constant [25 x i8] c"attempt to divide by zero"

; probe4::probe
; Function Attrs: nounwind
define hidden void @_ZN6probe45probe17h9435ff81b42dc35bE() unnamed_addr #0 {
start:
  %0 = call i1 @llvm.expect.i1(i1 false, i1 false)
  br i1 %0, label %panic.i, label %"_ZN4core3num21_$LT$impl$u20$u32$GT$10div_euclid17h24e115db3e945e51E.exit"

panic.i:                                          ; preds = %start
; call core::panicking::panic
  call void @_ZN4core9panicking5panic17h0743d89eafa4aff0E(ptr align 1 @str.0, i64 25, ptr align 8 @alloc_139151c42ef791b2d5e73ecdd341db03) #3
  unreachable

"_ZN4core3num21_$LT$impl$u20$u32$GT$10div_euclid17h24e115db3e945e51E.exit": ; preds = %start
  ret void
}

; Function Attrs: nocallback nofree nosync nounwind willreturn memory(none)
declare hidden i1 @llvm.expect.i1(i1, i1) #1

; core::panicking::panic
; Function Attrs: cold noinline noreturn nounwind
declare void @_ZN4core9panicking5panic17h0743d89eafa4aff0E(ptr align 1, i64, ptr align 8) unnamed_addr #2

attributes #0 = { nounwind "target-cpu"="generic" "target-features"="+solana" }
attributes #1 = { nocallback nofree nosync nounwind willreturn memory(none) }
attributes #2 = { cold noinline noreturn nounwind "target-cpu"="generic" "target-features"="+solana" }
attributes #3 = { noreturn nounwind }

!llvm.module.flags = !{!0}
!llvm.ident = !{!1}

!0 = !{i32 8, !"PIC Level", i32 2}
!1 = !{!"rustc version 1.75.0-dev"}
